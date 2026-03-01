"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { addToast } from "@/lib/toast";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import { loadPdfMake } from "@/lib/pdfmake-loader";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  businessName: string;
  email: string;
  address: string;
  phone: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  lineItems: LineItem[];
  taxRate: number;
  discount: number;
  discountType: "fixed" | "percent";
  notes: string;
  paymentTerms: string;
  logoBase64?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "\u20ac",
  GBP: "\u00a3",
  CAD: "CA$",
  AUD: "A$",
  INR: "\u20b9",
};

const currencies = Object.keys(currencySymbols);

function fmt(amount: number, currency: string): string {
  const sym = currencySymbols[currency] ?? "$";
  return `${sym}${amount.toFixed(2)}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function plus30(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>({
    businessName: "",
    email: "",
    address: "",
    phone: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "INV-001",
    // Set date fields after mount to avoid server/client hydration drift.
    invoiceDate: "",
    dueDate: "",
    currency: "USD",
    lineItems: [
      { id: "line-item-1", description: "", quantity: 1, price: 0 },
    ],
    taxRate: 0,
    discount: 0,
    discountType: "percent",
    notes: "",
    paymentTerms: "Net 30",
    logoBase64: undefined,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Initialize dynamic date defaults on client ──
  useEffect(() => {
    setData((prev) => {
      if (prev.invoiceDate && prev.dueDate) return prev;
      return {
        ...prev,
        invoiceDate: prev.invoiceDate || todayStr(),
        dueDate: prev.dueDate || plus30(),
      };
    });
  }, []);

  // ── Load saved sender details from localStorage ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem("invoice-sender");
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({
          ...prev,
          businessName: parsed.businessName || prev.businessName,
          email: parsed.email || prev.email,
          address: parsed.address || prev.address,
          phone: parsed.phone || prev.phone,
          logoBase64: parsed.logoBase64 || prev.logoBase64,
        }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ── Save sender details ──
  useEffect(() => {
    localStorage.setItem(
      "invoice-sender",
      JSON.stringify({
        businessName: data.businessName,
        email: data.email,
        address: data.address,
        phone: data.phone,
        logoBase64: data.logoBase64,
      })
    );
  }, [data.businessName, data.email, data.address, data.phone, data.logoBase64]);

  // ── Handlers ──

  const updateField = useCallback(
    <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const updateLineItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setData((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      }));
    },
    []
  );

  const addLineItem = useCallback(() => {
    setData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: generateId(), description: "", quantity: 1, price: 0 },
      ],
    }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  }, []);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 500 * 1024) {
        addToast("Logo must be under 500 KB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        updateField("logoBase64", reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [updateField]
  );

  // ── Calculations ──

  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const taxAmount = subtotal * (data.taxRate / 100);
  const discountAmount =
    data.discountType === "percent"
      ? subtotal * (data.discount / 100)
      : data.discount;
  const total = subtotal + taxAmount - discountAmount;

  // ── Generate PDF ──

  const generatePdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      const pdfMake = await loadPdfMake();

      // Build header
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headerColumns: any[] = [];

      // Left column: logo + sender info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leftCol: any[] = [];
      if (data.logoBase64) {
        leftCol.push({
          image: data.logoBase64,
          width: 80,
          margin: [0, 0, 0, 8],
        });
      }
      if (data.businessName)
        leftCol.push({
          text: data.businessName,
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 2],
        });
      if (data.address) leftCol.push({ text: data.address, fontSize: 9, color: "#555" });
      if (data.email) leftCol.push({ text: data.email, fontSize: 9, color: "#555" });
      if (data.phone) leftCol.push({ text: data.phone, fontSize: 9, color: "#555" });

      headerColumns.push({ stack: leftCol, width: "*" });

      // Right column: INVOICE title + details
      headerColumns.push({
        stack: [
          { text: "INVOICE", fontSize: 28, bold: true, color: "#1D4ED8", alignment: "right" },
          {
            text: `Invoice #: ${data.invoiceNumber}`,
            fontSize: 10,
            alignment: "right",
            margin: [0, 8, 0, 2],
          },
          {
            text: `Date: ${data.invoiceDate}`,
            fontSize: 10,
            alignment: "right",
            margin: [0, 0, 0, 2],
          },
          {
            text: `Due: ${data.dueDate}`,
            fontSize: 10,
            alignment: "right",
          },
        ],
        width: "auto",
      });

      // Build line items table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableBody: any[][] = [
        [
          { text: "Description", bold: true, fontSize: 10, fillColor: "#f3f4f6" },
          { text: "Qty", bold: true, fontSize: 10, alignment: "center", fillColor: "#f3f4f6" },
          { text: "Unit Price", bold: true, fontSize: 10, alignment: "right", fillColor: "#f3f4f6" },
          { text: "Amount", bold: true, fontSize: 10, alignment: "right", fillColor: "#f3f4f6" },
        ],
      ];

      for (const item of data.lineItems) {
        tableBody.push([
          { text: item.description || "-", fontSize: 10 },
          { text: String(item.quantity), fontSize: 10, alignment: "center" },
          { text: fmt(item.price, data.currency), fontSize: 10, alignment: "right" },
          {
            text: fmt(item.quantity * item.price, data.currency),
            fontSize: 10,
            alignment: "right",
          },
        ]);
      }

      // Totals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalsStack: any[] = [
        {
          columns: [
            { text: "Subtotal", width: "*", alignment: "right", fontSize: 10 },
            {
              text: fmt(subtotal, data.currency),
              width: 100,
              alignment: "right",
              fontSize: 10,
            },
          ],
          margin: [0, 2, 0, 2],
        },
      ];

      if (data.taxRate > 0) {
        totalsStack.push({
          columns: [
            {
              text: `Tax (${data.taxRate}%)`,
              width: "*",
              alignment: "right",
              fontSize: 10,
            },
            {
              text: fmt(taxAmount, data.currency),
              width: 100,
              alignment: "right",
              fontSize: 10,
            },
          ],
          margin: [0, 2, 0, 2],
        });
      }

      if (data.discount > 0) {
        const discLabel =
          data.discountType === "percent"
            ? `Discount (${data.discount}%)`
            : "Discount";
        totalsStack.push({
          columns: [
            {
              text: discLabel,
              width: "*",
              alignment: "right",
              fontSize: 10,
            },
            {
              text: `-${fmt(discountAmount, data.currency)}`,
              width: 100,
              alignment: "right",
              fontSize: 10,
            },
          ],
          margin: [0, 2, 0, 2],
        });
      }

      totalsStack.push({
        columns: [
          {
            text: "Total",
            width: "*",
            alignment: "right",
            fontSize: 14,
            bold: true,
          },
          {
            text: fmt(total, data.currency),
            width: 100,
            alignment: "right",
            fontSize: 14,
            bold: true,
            color: "#1D4ED8",
          },
        ],
        margin: [0, 6, 0, 0],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDef: any = {
        pageSize: "A4",
        pageMargins: [40, 40, 40, 40],
        content: [
          { columns: headerColumns, columnGap: 20 },
          { canvas: [{ type: "line", x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: "#e5e7eb" }] },
          // Bill To
          {
            text: "Bill To",
            fontSize: 11,
            bold: true,
            color: "#374151",
            margin: [0, 16, 0, 4],
          },
          ...(data.clientName
            ? [{ text: data.clientName, fontSize: 10, bold: true }]
            : []),
          ...(data.clientAddress
            ? [{ text: data.clientAddress, fontSize: 9, color: "#555" }]
            : []),
          ...(data.clientEmail
            ? [{ text: data.clientEmail, fontSize: 9, color: "#555" }]
            : []),
          // Line items table
          {
            table: {
              headerRows: 1,
              widths: ["*", 50, 80, 80],
              body: tableBody,
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0,
              hLineColor: () => "#e5e7eb",
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
            margin: [0, 16, 0, 8],
          },
          // Totals
          ...totalsStack,
          // Notes
          ...(data.notes
            ? [
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0, y1: 16,
                      x2: 515, y2: 16,
                      lineWidth: 0.5,
                      lineColor: "#e5e7eb",
                    },
                  ],
                },
                {
                  text: "Notes",
                  fontSize: 10,
                  bold: true,
                  margin: [0, 24, 0, 4],
                },
                { text: data.notes, fontSize: 9, color: "#555" },
              ]
            : []),
          // Payment terms
          ...(data.paymentTerms
            ? [
                {
                  text: "Payment Terms",
                  fontSize: 10,
                  bold: true,
                  margin: [0, 12, 0, 4],
                },
                { text: data.paymentTerms, fontSize: 9, color: "#555" },
              ]
            : []),
        ],
        defaultStyle: {
          font: "Roboto",
        },
      };

      pdfMake
        .createPdf(docDef)
        .download(`invoice-${data.invoiceNumber}.pdf`);

      addToast("Invoice PDF generated", "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      addToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [data, subtotal, taxAmount, discountAmount, total]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── Form ── */}
      <div className="space-y-6">
        {/* Your Details */}
        <fieldset className="rounded-xl border border-border bg-card p-5 space-y-4">
          <legend className="text-sm font-semibold px-1">Your Details</legend>
          <div className="space-y-3">
            <Input
              label="Business Name"
              value={data.businessName}
              onChange={(v) => updateField("businessName", v)}
            />
            <Input
              label="Email"
              type="email"
              value={data.email}
              onChange={(v) => updateField("email", v)}
            />
            <Input
              label="Address"
              value={data.address}
              onChange={(v) => updateField("address", v)}
            />
            <Input
              label="Phone"
              value={data.phone}
              onChange={(v) => updateField("phone", v)}
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Logo
              </label>
              <div className="flex items-center gap-3">
                {data.logoBase64 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.logoBase64}
                    alt="Logo"
                    className="h-10 w-10 rounded border border-border object-contain"
                  />
                )}
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {data.logoBase64 ? "Change" : "Upload"}
                </button>
                {data.logoBase64 && (
                  <button
                    onClick={() => updateField("logoBase64", undefined)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Client Details */}
        <fieldset className="rounded-xl border border-border bg-card p-5 space-y-4">
          <legend className="text-sm font-semibold px-1">Client Details</legend>
          <div className="space-y-3">
            <Input
              label="Client Name"
              value={data.clientName}
              onChange={(v) => updateField("clientName", v)}
            />
            <Input
              label="Client Email"
              type="email"
              value={data.clientEmail}
              onChange={(v) => updateField("clientEmail", v)}
            />
            <Input
              label="Client Address"
              value={data.clientAddress}
              onChange={(v) => updateField("clientAddress", v)}
            />
          </div>
        </fieldset>

        {/* Invoice Details */}
        <fieldset className="rounded-xl border border-border bg-card p-5 space-y-4">
          <legend className="text-sm font-semibold px-1">
            Invoice Details
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Invoice Number"
              value={data.invoiceNumber}
              onChange={(v) => updateField("invoiceNumber", v)}
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Currency
              </label>
              <select
                value={data.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c} ({currencySymbols[c]})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Invoice Date"
              type="date"
              value={data.invoiceDate}
              onChange={(v) => updateField("invoiceDate", v)}
            />
            <Input
              label="Due Date"
              type="date"
              value={data.dueDate}
              onChange={(v) => updateField("dueDate", v)}
            />
          </div>
        </fieldset>

        {/* Line Items */}
        <fieldset className="rounded-xl border border-border bg-card p-5 space-y-4">
          <legend className="text-sm font-semibold px-1">Line Items</legend>
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_80px_80px_32px] gap-2 text-xs font-medium text-muted-foreground">
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Price</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            {data.lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_60px_80px_80px_32px] gap-2 items-center"
              >
                <input
                  value={item.description}
                  onChange={(e) =>
                    updateLineItem(item.id, "description", e.target.value)
                  }
                  placeholder="Service or product"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={item.quantity || ""}
                  onChange={(e) =>
                    updateLineItem(item.id, "quantity", Number(e.target.value))
                  }
                  className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-center tabular-nums"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.price || ""}
                  onChange={(e) =>
                    updateLineItem(item.id, "price", Number(e.target.value))
                  }
                  className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-right tabular-nums"
                />
                <div className="text-sm text-right tabular-nums text-foreground">
                  {fmt(item.quantity * item.price, data.currency)}
                </div>
                <button
                  onClick={() => removeLineItem(item.id)}
                  disabled={data.lineItems.length <= 1}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addLineItem}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>
        </fieldset>

        {/* Totals / Tax / Discount */}
        <fieldset className="rounded-xl border border-border bg-card p-5 space-y-4">
          <legend className="text-sm font-semibold px-1">
            Totals
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tax Rate (%)"
              type="number"
              value={String(data.taxRate)}
              onChange={(v) => updateField("taxRate", Number(v))}
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Discount
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={data.discount || ""}
                  onChange={(e) =>
                    updateField("discount", Number(e.target.value))
                  }
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums"
                />
                <button
                  onClick={() =>
                    updateField(
                      "discountType",
                      data.discountType === "percent" ? "fixed" : "percent"
                    )
                  }
                  className="rounded-lg border border-border px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  {data.discountType === "percent" ? "%" : currencySymbols[data.currency]}
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Notes & Payment Terms */}
        <fieldset className="rounded-xl border border-border bg-card p-5 space-y-4">
          <legend className="text-sm font-semibold px-1">Additional</legend>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Notes
              </label>
              <textarea
                value={data.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
                placeholder="Thank you for your business!"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
              />
            </div>
            <Input
              label="Payment Terms"
              value={data.paymentTerms}
              onChange={(v) => updateField("paymentTerms", v)}
              placeholder="Net 30"
            />
          </div>
        </fieldset>

        {/* Generate button (mobile) */}
        <button
          onClick={generatePdf}
          disabled={isGenerating}
          className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed lg:hidden"
        >
          <span className="flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating\u2026" : "Download PDF"}
          </span>
        </button>
      </div>

      {/* ── Live Preview ── */}
      <div className="space-y-4">
        <div className="sticky top-20">
          {/* Preview card */}
          <div className="rounded-xl border border-border bg-white shadow-sm p-8 text-[11px] leading-relaxed text-gray-800 min-h-[600px]">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                {data.logoBase64 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.logoBase64}
                    alt="Logo"
                    className="h-10 mb-2 object-contain"
                  />
                )}
                {data.businessName && (
                  <p className="text-sm font-bold text-gray-900">
                    {data.businessName}
                  </p>
                )}
                {data.address && (
                  <p className="text-gray-500">{data.address}</p>
                )}
                {data.email && (
                  <p className="text-gray-500">{data.email}</p>
                )}
                {data.phone && (
                  <p className="text-gray-500">{data.phone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">INVOICE</p>
                <p className="mt-2">
                  # {data.invoiceNumber}
                </p>
                <p>Date: {data.invoiceDate}</p>
                <p>Due: {data.dueDate}</p>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Bill To */}
            <div className="mb-4">
              <p className="font-semibold text-gray-700 mb-1">Bill To</p>
              {data.clientName && (
                <p className="font-medium">{data.clientName}</p>
              )}
              {data.clientAddress && (
                <p className="text-gray-500">{data.clientAddress}</p>
              )}
              {data.clientEmail && (
                <p className="text-gray-500">{data.clientEmail}</p>
              )}
            </div>

            {/* Items table */}
            <table className="w-full mb-4 text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-1.5 px-2 font-semibold">Description</th>
                  <th className="py-1.5 px-2 font-semibold text-center w-12">
                    Qty
                  </th>
                  <th className="py-1.5 px-2 font-semibold text-right w-20">
                    Price
                  </th>
                  <th className="py-1.5 px-2 font-semibold text-right w-20">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-1.5 px-2">
                      {item.description || "-"}
                    </td>
                    <td className="py-1.5 px-2 text-center tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums">
                      {fmt(item.price, data.currency)}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums">
                      {fmt(item.quantity * item.price, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex flex-col items-end space-y-1 mb-4">
              <div className="flex justify-between w-48">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  {fmt(subtotal, data.currency)}
                </span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between w-48">
                  <span>Tax ({data.taxRate}%)</span>
                  <span className="tabular-nums">
                    {fmt(taxAmount, data.currency)}
                  </span>
                </div>
              )}
              {data.discount > 0 && (
                <div className="flex justify-between w-48">
                  <span>
                    Discount
                    {data.discountType === "percent"
                      ? ` (${data.discount}%)`
                      : ""}
                  </span>
                  <span className="tabular-nums">
                    -{fmt(discountAmount, data.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between w-48 border-t border-gray-200 pt-1 font-bold text-sm">
                <span>Total</span>
                <span className="tabular-nums text-blue-700">
                  {fmt(total, data.currency)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="font-semibold text-gray-700 mb-1">Notes</p>
                <p className="text-gray-500 whitespace-pre-wrap">
                  {data.notes}
                </p>
              </div>
            )}

            {/* Payment Terms */}
            {data.paymentTerms && (
              <div className="mt-3">
                <p className="font-semibold text-gray-700 mb-1">
                  Payment Terms
                </p>
                <p className="text-gray-500">{data.paymentTerms}</p>
              </div>
            )}
          </div>

          {/* Generate button (desktop) */}
          <button
            onClick={generatePdf}
            disabled={isGenerating}
            className="mt-4 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating\u2026" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Input ─────────────────────────────────────────────────────────

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
