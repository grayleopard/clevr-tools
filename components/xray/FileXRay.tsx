/**
 * File X-Ray is intentionally contained. Keep these compatibility exports so
 * the PDF tool pages do not need a routing rewrite while the external
 * processing contract and consent experience remain unapproved.
 */
export function FileXRayTrigger() {
  return null;
}

export default function FileXRay(props: { showTrigger?: boolean }) {
  void props;
  return null;
}
