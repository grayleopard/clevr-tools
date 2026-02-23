import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "clevr.tools processes all files entirely in your browser. Your files never leave your device. Learn what data we collect and how we use it.",
  alternates: {
    canonical: "https://clevr.tools/privacy",
  },
  openGraph: {
    title: "Privacy Policy | clevr.tools",
    description:
      "clevr.tools processes all files entirely in your browser. Your files never leave your device.",
    url: "https://clevr.tools/privacy",
    siteName: "clevr.tools",
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: February 2026</p>
          </div>

          {/* Core trust statement */}
          <div className="mb-10 rounded-xl border border-primary/25 bg-primary/5 px-6 py-5">
            <p className="font-semibold text-primary">
              Your files never leave your device.
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Every tool on clevr.tools runs entirely in your browser. When you compress an image,
              convert a file, or generate a QR code, the processing happens locally on your machine.
              Nothing is uploaded to our servers — because we don&apos;t have servers that touch your files.
            </p>
          </div>

          <div className="space-y-10 text-sm leading-relaxed text-foreground">
            {/* How the tools work */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">How the Tools Work</h2>
              <p className="text-muted-foreground">
                All file processing uses browser APIs — the Canvas API, the File API, and
                JavaScript libraries that run entirely on your device. When you drop a file into
                one of our tools, it&apos;s read directly into your browser&apos;s memory and
                processed there. The result is handed back to you as a download. We never see the
                file, and neither does any external server.
              </p>
              <p className="text-muted-foreground">
                Files exist only in your browser&apos;s memory during processing. When you close
                the tab or navigate away, they&apos;re gone. We have no copies and no way to
                retrieve them.
              </p>
            </section>

            {/* Analytics */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Usage Analytics</h2>
              <p className="text-muted-foreground">
                We use Google Analytics to understand how people use the site — which tools get
                used, which pages are visited, and how traffic flows. This data is anonymous and
                aggregated. We can see that &ldquo;someone visited the image compressor&rdquo; but
                not who you are.
              </p>
              <p className="text-muted-foreground">
                We don&apos;t collect names, email addresses, or any personally identifying
                information. There are no accounts and no sign-ups.
              </p>
            </section>

            {/* Advertising */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Advertising</h2>
              <p className="text-muted-foreground">
                clevr.tools uses Google AdSense to show ads. AdSense may set cookies and use your
                browsing history to show you personalized ads. This is Google&apos;s system — we
                don&apos;t have access to that data and don&apos;t control how ads are targeted.
              </p>
              <p className="text-muted-foreground">
                You can opt out of personalized ads through{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  Google&apos;s Ad Settings
                </a>
                . You can also install an ad blocker if you prefer not to see ads at all.
              </p>
              <p className="text-muted-foreground">
                For more details, see{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  Google&apos;s Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* Cookies */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Cookies</h2>
              <p className="text-muted-foreground">
                We don&apos;t set any first-party cookies of our own. Google Analytics and Google
                AdSense may set third-party cookies as described in their respective policies.
                Your dark/light mode preference is stored in your browser&apos;s local storage —
                it stays on your device and is never sent anywhere.
              </p>
            </section>

            {/* Future AI tools */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Future AI-Powered Tools</h2>
              <p className="text-muted-foreground">
                We&apos;re building AI-powered tools that will require sending data to external
                APIs for processing. When those launch, we&apos;ll clearly label them with an
                &ldquo;AI&rdquo; badge and explain exactly what data is sent, to whom, and why.
                You&apos;ll always know before using them, and any tools that send data externally
                will be clearly distinguished from the local-only tools on the site today.
              </p>
            </section>

            {/* Third party links */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our tools and pages may contain links to external websites. We&apos;re not
                responsible for the privacy practices of those sites. If you follow a link to an
                external site, that site&apos;s own privacy policy applies.
              </p>
            </section>

            {/* Changes */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                If we make meaningful changes to this policy, we&apos;ll update the date at the
                top of this page. The core commitment — that local tools will never upload your
                files — won&apos;t change. If we ever needed to change that, we&apos;d make it
                obvious.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Contact</h2>
              <p className="text-muted-foreground">
                Questions about privacy? Email{" "}
                <a
                  href="mailto:privacy@clevr.tools"
                  className="text-primary underline hover:opacity-80 transition-opacity"
                >
                  privacy@clevr.tools
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
