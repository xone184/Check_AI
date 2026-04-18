<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/22f37bf9-f745-4c3c-b0a2-bc929d16363d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_GROQ_API_KEY` in [.env.local](.env.local) to your [Groq](https://console.groq.com) API key (optional: `VITE_GROQ_MODEL`). Restart `npm run dev` after editing env.
3. Run the app:
   `npm run dev`

## Code sandbox (CodeSandbox, StackBlitz, GitHub Codespaces)

### Chuẩn bị chung

1. Đưa mã lên **GitHub** (không commit `.env.local` hay API key).
2. Trên sandbox, thêm **biến môi trường** (Secrets / Environment) như [.env.example](.env.example), tối thiểu `VITE_GROQ_API_KEY`; tuỳ chọn `VITE_GROQ_MODEL`, `VITE_GROQ_MAX_INPUT_CHARS`.
3. Sau khi đổi env: **dừng và chạy lại** `npm run dev` (Vite chỉ đọc `VITE_*` khi khởi động).
4. Ứng dụng dùng cổng **3000**.

**Bảo mật:** `VITE_*` được nhúng vào bundle trình duyệt — chỉ dùng key thử / repo riêng.

### A. CodeSandbox

1. [codesandbox.io](https://codesandbox.io) → **Create** → **Import repository** → dán URL GitHub repo.
2. **Project settings** / **Env secrets** → thêm `VITE_GROQ_API_KEY` (và biến tuỳ chọn).
3. Repo đã có [`.codesandbox/tasks.json`](.codesandbox/tasks.json): `npm install` + `npm run dev`. Mở **Preview** cổng **3000**. Nếu cần, restart task **dev** sau khi lưu secrets.

#### Miền xem trước công khai (`*.csb.app`)

CodeSandbox inject biến **`CODESANDBOX_HOST`** vào process khi chạy task (dạng `id-cổng.csb.app`, ví dụ `abc12-3000.csb.app`). Trong repo này, [`vite.config.ts`](vite.config.ts) đọc biến đó và gắn vào client dưới dạng **`import.meta.env.VITE_CSB_PUBLIC_ORIGIN`** (URL đầy đủ `https://…`).

Trong code, dùng helper [`getPublicAppOrigin()`](src/lib/publicOrigin.ts) (ưu tiên `VITE_PUBLIC_APP_URL` nếu bạn tự đặt → `VITE_CSB_PUBLIC_ORIGIN` → `window.location.origin`). Footer ứng dụng hiển thị **Miền công khai** để bạn đối chiếu.

Tài liệu chính thức: [Preview URLs – CodeSandbox](https://codesandbox.io/docs/learn/environment/preview-urls).

### B. StackBlitz

1. Mở `https://stackblitz.com/github/<USER>/<REPO>` (thay user/repo), hoặc dùng nút **Open in StackBlitz** từ GitHub nếu có.
2. **Settings** → **Environment variables** → thêm `VITE_GROQ_API_KEY`.
3. [`stackblitz.json`](stackblitz.json) gợi ý `npm run dev`; nếu chưa chạy, mở terminal trong editor và gõ `npm run dev`.

### C. GitHub Codespaces

1. Repo → **Code** → **Codespaces** → **Create codespace** trên nhánh bạn dùng.
2. [`.devcontainer/devcontainer.json`](.devcontainer/devcontainer.json) chạy `npm install` lần đầu.
3. **Secrets:** Repo → **Settings** → **Secrets and variables** → **Codespaces** → tạo secret `VITE_GROQ_API_KEY`. Hoặc trong terminal codespace: tạo `.env.local` (không commit) rồi `npm run dev`.
4. Forward cổng **3000** → **Open in Browser**.

### D. VS Code Dev Containers (local)

Cài extension **Dev Containers** → **Command Palette** → **Dev Containers: Reopen in Container** → trong container tạo `.env.local` với `VITE_GROQ_API_KEY` → `npm run dev`.
