export type BodyFatGender = "male" | "female";

export interface CircumferenceMeasurementsCm {
  gender: BodyFatGender;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}

export type CircumferenceEstimate =
  | { ok: true; bodyFatPercent: number; bodyDensity: number }
  | { ok: false; error: string };

export const CIRCUMFERENCE_FORMULAS = {
  male:
    "Density = 1.0324 - 0.191 x log10(waist - neck) + 0.155 x log10(height)",
  female:
    "Density = 1.296 - 0.350 x log10(waist + hip - neck) + 0.221 x log10(height)",
  conversion: "Body fat % = 495 / density - 450",
  units: "Height and circumferences are measured in centimeters.",
} as const;

/**
 * Hodgdon-Beckett circumference estimate in its published body-density form.
 * This is a screening estimate, not the Navy's current official BCA process.
 */
export function estimateCircumferenceBodyFat(
  measurements: CircumferenceMeasurementsCm,
): CircumferenceEstimate {
  const { gender, heightCm, neckCm, waistCm } = measurements;
  const hipCm = measurements.hipCm ?? Number.NaN;

  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(neckCm) ||
    !Number.isFinite(waistCm) ||
    heightCm <= 0 ||
    neckCm <= 0 ||
    waistCm <= 0
  ) {
    return { ok: false, error: "Enter positive, finite height, neck, and waist measurements." };
  }

  if (gender === "female" && (!Number.isFinite(hipCm) || hipCm <= 0)) {
    return { ok: false, error: "Enter a positive, finite hip measurement." };
  }

  const circumferenceCm =
    gender === "male" ? waistCm - neckCm : waistCm + hipCm - neckCm;

  if (!Number.isFinite(circumferenceCm) || circumferenceCm <= 0) {
    return {
      ok: false,
      error:
        gender === "male"
          ? "Waist must be larger than neck for this formula."
          : "Waist plus hip must be larger than neck for this formula.",
    };
  }

  const bodyDensity =
    gender === "male"
      ? 1.0324 - 0.191 * Math.log10(circumferenceCm) + 0.155 * Math.log10(heightCm)
      : 1.296 - 0.350 * Math.log10(circumferenceCm) + 0.221 * Math.log10(heightCm);
  const bodyFatPercent = 495 / bodyDensity - 450;

  if (
    !Number.isFinite(bodyDensity) ||
    bodyDensity <= 0 ||
    !Number.isFinite(bodyFatPercent) ||
    bodyFatPercent <= 0 ||
    bodyFatPercent >= 100
  ) {
    return {
      ok: false,
      error: "These measurements produce a result outside the formula's physical range. Check each measurement.",
    };
  }

  return { ok: true, bodyFatPercent, bodyDensity };
}
