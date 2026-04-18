const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Giới hạn an toàn cho tầng on_demand (~12k TPM/request). Có thể tăng nhẹ qua VITE_GROQ_MAX_INPUT_CHARS. */
export function getGroqScanCharCap(): number {
  const raw = import.meta.env.VITE_GROQ_MAX_INPUT_CHARS;
  const n = raw !== undefined ? Number(String(raw).trim()) : NaN;
  if (Number.isFinite(n) && n >= 1500 && n <= 15000) return Math.floor(n);
  return 4000;
}

export interface RewriteVariant {
  label: string;
  text: string;
}

export interface PlagiarismSegment {
  originalText: string;
  similarityScore: number;
  sourceUrl?: string;
  reasoning: string;
  severity?: "low" | "medium" | "high";
  plagiarismKind?:
    | "verbatim"
    | "mosaic"
    | "ai_like"
    | "likely_legitimate_quote"
    | "unclear";
  suggestedRewrite: string;
  rewriteVariants?: RewriteVariant[];
}

export interface PlagiarismResult {
  /** 0–100: mức độ rủi ro trùng lặp / đạo văn (cao = xấu hơn) */
  overallScore: number;
  /** 0–100: điểm an toàn nguyên bản (cao = an toàn hơn) */
  safetyScore: number;
  segments: PlagiarismSegment[];
  summary: string;
  /** true nếu văn bản đầu vào bị cắt trước khi gửi Groq (giới hạn TPM) */
  scanInputTruncated?: boolean;
  scanInputOriginalChars?: number;
  scanInputSentChars?: number;
}

function extractJsonFromAssistantContent(raw: string): string {
  const t = raw.trim();
  const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/m.exec(t);
  if (fence) return fence[1].trim();
  return t;
}

function normalizeResult(parsed: Partial<PlagiarismResult>): PlagiarismResult {
  const overall = Math.min(
    100,
    Math.max(0, Number(parsed.overallScore) || 0)
  );
  const safetyRaw =
    parsed.safetyScore !== undefined
      ? Number(parsed.safetyScore)
      : Math.round(100 - overall);
  const safety = Math.min(100, Math.max(0, safetyRaw));

  const segments = Array.isArray(parsed.segments) ? parsed.segments : [];

  const normalizedSegments: PlagiarismSegment[] = segments.map((s) => {
    const variants = Array.isArray(s.rewriteVariants)
      ? s.rewriteVariants.filter(
          (v) =>
            v &&
            typeof v.label === "string" &&
            typeof v.text === "string" &&
            v.text.trim().length > 0
        )
      : [];
    return {
      originalText: String(s.originalText ?? ""),
      similarityScore: Math.min(
        100,
        Math.max(0, Number(s.similarityScore) || 0)
      ),
      sourceUrl: s.sourceUrl ? String(s.sourceUrl) : undefined,
      reasoning: String(s.reasoning ?? ""),
      severity: s.severity,
      plagiarismKind: s.plagiarismKind,
      suggestedRewrite: String(s.suggestedRewrite ?? ""),
      rewriteVariants: variants,
    };
  });

  return {
    overallScore: overall,
    safetyScore: safety,
    segments: normalizedSegments,
    summary: String(parsed.summary ?? ""),
  };
}

const SYSTEM_PROMPT = `Chuyên gia kiểm định học thuật (tiếng Việt). Phát hiện đạo văn/trích dẫn sai/patchwriting/dấu hiệu AI; đề xuất viết lại.
overallScore/safetyScore 0-100. suggestedRewrite + rewriteVariants (>=2 bản khác rõ, label+text tiếng Việt). reasoning/summary tiếng Việt.
Chỉ trả JSON hợp lệ, không markdown.`;

function buildUserPrompt(text: string, truncated: boolean): string {
  const head = truncated
    ? "Lưu ý: chỉ có phần đầu văn bản (giới hạn độ dài API). Phân tích trên đoạn sau.\n\n"
    : "";
  return `${head}Trả về một JSON: overallScore, safetyScore, summary, segments[] { originalText, similarityScore, sourceUrl?, reasoning, severity, plagiarismKind, suggestedRewrite, rewriteVariants[{label,text}] }.
severity: low|medium|high. plagiarismKind: verbatim|mosaic|ai_like|likely_legitimate_quote|unclear.

VĂN BẢN:
"""
${text}
"""`;
}

function clipInputForGroq(raw: string): {
  text: string;
  truncated: boolean;
  originalLength: number;
} {
  const t = raw.trim();
  const cap = getGroqScanCharCap();
  if (t.length <= cap) return { text: t, truncated: false, originalLength: t.length };
  return { text: t.slice(0, cap), truncated: true, originalLength: t.length };
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Thiếu VITE_GROQ_API_KEY. Thêm vào .env.local: VITE_GROQ_API_KEY=gsk_... rồi chạy lại npm run dev."
    );
  }

  const { text: clipped, truncated, originalLength } = clipInputForGroq(text);

  const model =
    import.meta.env.VITE_GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

  const res = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(clipped, truncated) },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let hint = "";
    try {
      const j = JSON.parse(errBody) as {
        error?: { message?: string; code?: string };
      };
      const m = j.error?.message ?? "";
      if (
        res.status === 413 ||
        m.toLowerCase().includes("too large") ||
        j.error?.code === "rate_limit_exceeded"
      ) {
        hint =
          "\n\nGợi ý: văn bản quá dài cho hạn mức Groq (on_demand). Hãy rút ngắn bài, hoặc giảm VITE_GROQ_MAX_INPUT_CHARS trong .env.local (ví dụ 4000), hoặc nâng gói Dev Tier.";
      }
    } catch {
      /* ignore */
    }
    throw new Error(`Groq API ${res.status}: ${errBody.slice(0, 500)}${hint}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq: không có nội dung phản hồi.");
  }

  let parsed: Partial<PlagiarismResult>;
  try {
    parsed = JSON.parse(extractJsonFromAssistantContent(content));
  } catch {
    throw new Error("Groq: phản hồi không phải JSON hợp lệ.");
  }

  const base = normalizeResult(parsed);
  return {
    ...base,
    scanInputTruncated: truncated,
    scanInputOriginalChars: originalLength,
    scanInputSentChars: clipped.length,
  };
}
