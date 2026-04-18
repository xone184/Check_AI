/**
 * URL gốc công khai của app (OAuth, webhook, chia sẻ liên kết).
 *
 * Thứ tự ưu tiên:
 * 1. VITE_PUBLIC_APP_URL — bạn tự đặt trong .env / secrets sandbox.
 * 2. VITE_CSB_PUBLIC_ORIGIN — Vite gắn từ biến CODESANDBOX_HOST khi chạy trên CodeSandbox.
 * 3. window.location.origin — khi đang mở app trong trình duyệt (luôn đúng với tab hiện tại).
 */
export function getPublicAppOrigin(): string {
  const manual = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  if (manual) return manual.replace(/\/$/, "");

  const csb = import.meta.env.VITE_CSB_PUBLIC_ORIGIN?.trim();
  if (csb) return csb.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}
