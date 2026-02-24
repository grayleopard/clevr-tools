/**
 * Module-level store for handing off a File from the SmartConverter to a
 * dedicated tool page during client-side navigation.
 *
 * File objects can't go through sessionStorage/URL params, but they survive
 * same-tab router.push() navigation because the JS heap is kept alive.
 *
 * Usage:
 *   SmartConverter:  setPendingFile(file); router.push("/tools/split-pdf");
 *   Tool page:       const file = takePendingFile(); // consumes + clears
 */

let pendingFile: File | null = null;

/** Store a file to be picked up by the next tool page that mounts. */
export function setPendingFile(file: File): void {
  pendingFile = file;
}

/**
 * Consume the pending file (returns it and clears the store).
 * Returns null if no file is waiting.
 */
export function takePendingFile(): File | null {
  const f = pendingFile;
  pendingFile = null;
  return f;
}
