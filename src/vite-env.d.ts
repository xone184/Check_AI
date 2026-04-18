/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_GROQ_MODEL?: string;
  /** Giới hạn ký tự gửi API (1500–15000), mặc định ~5200 để tránh lỗi TPM free tier */
  readonly VITE_GROQ_MAX_INPUT_CHARS?: string;
  /** Gắn bởi vite.config khi VM có CODESANDBOX_HOST (CodeSandbox) */
  readonly VITE_CSB_PUBLIC_ORIGIN?: string;
  /** Tuỳ chọn: ghi đè URL công khai (sandbox / production) */
  readonly VITE_PUBLIC_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
