import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ChevronRight, CheckCircle, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { PlagiarismResult, PlagiarismSegment } from '../lib/groq';
import { cn, formatPercent } from '../lib/utils';

interface ResultDisplayProps {
  result: PlagiarismResult;
  onReset: () => void;
  onApplyRewrite: (original: string, rewrite: string) => void;
}

const SEVERITY_VI: Record<string, string> = {
  low: 'Mức độ: thấp',
  medium: 'Mức độ: trung bình',
  high: 'Mức độ: cao',
};

const KIND_VI: Record<string, string> = {
  verbatim: 'Sao chép nguyên văn',
  mosaic: 'Ghép nối / patchwriting',
  ai_like: 'Dấu hiệu văn bản AI',
  likely_legitimate_quote: 'Có thể trích dẫn hợp lệ',
  unclear: 'Chưa phân loại rõ',
};

function buildRewriteOptions(segment: PlagiarismSegment): { label: string; text: string }[] {
  const primary = {
    label: 'Phiên bản khuyến nghị',
    text: segment.suggestedRewrite?.trim() ?? '',
  };
  const extras = (segment.rewriteVariants ?? []).map((v) => ({
    label: v.label?.trim() || 'Phiên bản thay thế',
    text: v.text?.trim() ?? '',
  }));
  const list = [primary, ...extras].filter((o) => o.text.length > 0);
  return list.length > 0 ? list : [{ label: '—', text: '(Chưa có gợi ý viết lại)' }];
}

export default function ResultDisplay({ result, onReset, onApplyRewrite }: ResultDisplayProps) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set());
  const [variantIndexBySegment, setVariantIndexBySegment] = useState<Record<number, number>>({});

  const handleApply = (idx: number, original: string, rewrite: string) => {
    if (!rewrite.trim() || rewrite.startsWith('(')) return;
    onApplyRewrite(original, rewrite);
    setAppliedIndices((prev) => new Set(prev).add(idx));
  };

  const variantPick = (idx: number) => variantIndexBySegment[idx] ?? 0;

  const setVariantPick = (idx: number, v: number) => {
    setVariantIndexBySegment((prev) => ({ ...prev, [idx]: v }));
  };

  return (
    <div className="space-y-6">
      {result.scanInputTruncated && (
        <div className="flex gap-3 p-4 rounded-card border border-amber-200 bg-amber-50 text-amber-950 text-sm">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold">Chỉ phân tích phần đầu văn bản</p>
            <p className="text-amber-900/90 mt-1 leading-relaxed">
              Đã gửi khoảng {result.scanInputSentChars?.toLocaleString()} /{" "}
              {result.scanInputOriginalChars?.toLocaleString()} ký tự do giới hạn Groq (on_demand /
              TPM). Kết quả không phản ánh toàn bộ tài liệu — hãy chia nhỏ và quét từng phần.
            </p>
          </div>
        </div>
      )}

      {/* Summary Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-border rounded-card overflow-hidden">
        <div
          className={cn(
            'col-span-1 p-8 bg-white flex flex-col items-center justify-center text-center'
          )}
        >
          <div className="text-4xl font-black text-danger line-height-1">
            {formatPercent(result.overallScore / 100)}
          </div>
          <div className="text-xs font-semibold text-text-sub uppercase tracking-wider mt-2">
            Tỷ lệ rủi ro trùng lặp
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-danger transition-all duration-1000"
              style={{ width: `${result.overallScore}%` }}
            />
          </div>
        </div>

        <div className="col-span-1 p-8 bg-white flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-border">
          <div className="text-4xl font-black text-success line-height-1">
            {formatPercent(result.safetyScore / 100)}
          </div>
          <div className="text-xs font-semibold text-text-sub uppercase tracking-wider mt-2">
            Điểm an toàn (0–100%)
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-1000"
              style={{ width: `${result.safetyScore}%` }}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 p-8 bg-white flex flex-col justify-center border-t md:border-t-0 md:border-l border-border">
          <h3 className="text-xs font-bold text-text-sub uppercase tracking-widest mb-3">
            Tóm tắt kiểm định
          </h3>
          <p className="text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
            &quot;{result.summary}&quot;
          </p>
          <div className="pt-6 flex gap-3 flex-wrap">
            <button
              onClick={onReset}
              className="sleek-btn sleek-btn-outline flex items-center gap-2"
            >
              <RefreshCw size={16} /> Quét Mới
            </button>
            <button className="sleek-btn sleek-btn-primary flex items-center gap-2">
              Lưu Báo Cáo
            </button>
          </div>
        </div>
      </div>

      {/* Flagged Segments */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-sub uppercase tracking-widest px-1">
          Đoạn nghi ngờ &amp; gợi ý (AI Groq — song song mô phỏng Copyleaks)
        </h3>

        <div className="space-y-3">
          {result.segments.map((segment, idx) => {
            const options = buildRewriteOptions(segment);
            const vi = variantPick(idx);
            const selected = options[Math.min(vi, options.length - 1)];

            return (
              <div
                key={idx}
                className={cn(
                  'group rounded-[12px] border border-border bg-white transition-all overflow-hidden',
                  selectedSegment === idx
                    ? 'ring-1 ring-primary border-primary'
                    : 'hover:border-slate-300'
                )}
                onClick={() => setSelectedSegment(selectedSegment === idx ? null : idx)}
              >
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                      <span className="text-sm font-bold text-text-main truncate pr-4">
                        {segment.sourceUrl || 'Nguồn chưa xác định'}
                      </span>
                      <span className="text-xs font-bold text-danger shrink-0">
                        {segment.similarityScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {segment.severity && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {SEVERITY_VI[segment.severity] ?? segment.severity}
                        </span>
                      )}
                      {segment.plagiarismKind && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100">
                          {KIND_VI[segment.plagiarismKind] ?? segment.plagiarismKind}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-sub line-clamp-1 italic">
                      &quot;{segment.originalText}&quot;
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'transition-transform text-slate-300 shrink-0',
                      selectedSegment === idx && 'rotate-90'
                    )}
                    size={20}
                  />
                </div>

                <AnimatePresence>
                  {selectedSegment === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-50"
                    >
                      <div className="p-5 bg-sidebar/50">
                        <div className="space-y-4">
                          <div className="ai-suggestion">
                            <div className="flex items-center gap-2 text-xs font-bold text-success uppercase tracking-wider mb-2">
                              <Sparkles size={14} /> Gợi ý viết lại (nhiều phiên bản)
                            </div>

                            {options.length > 1 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {options.map((opt, oi) => (
                                  <button
                                    key={oi}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVariantPick(idx, oi);
                                    }}
                                    className={cn(
                                      'text-[11px] font-bold px-2.5 py-1 rounded-sleek border transition-colors',
                                      variantPick(idx) === oi
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white border-border text-text-sub hover:border-slate-300'
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="rounded-sleek border border-border bg-white p-3 space-y-2">
                              <div className="text-[10px] font-bold text-text-sub uppercase">
                                Trước
                              </div>
                              <p className="text-sm leading-relaxed text-danger line-through opacity-70">
                                {segment.originalText}
                              </p>
                              <div className="text-[10px] font-bold text-text-sub uppercase pt-1">
                                Sau (phiên bản đã chọn)
                              </div>
                              <p className="text-sm leading-relaxed text-success font-medium">
                                {selected.text}
                              </p>
                            </div>

                            <button
                              disabled={appliedIndices.has(idx) || !selected.text.trim()}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApply(idx, segment.originalText, selected.text);
                              }}
                              className={cn(
                                'w-full mt-4 sleek-btn !text-[11px] !py-1.5 focus:outline-none',
                                appliedIndices.has(idx)
                                  ? 'bg-slate-100 text-slate-400 cursor-default'
                                  : 'sleek-btn-primary'
                              )}
                            >
                              {appliedIndices.has(idx)
                                ? 'Đã áp dụng thay thế'
                                : 'Áp dụng thay thế'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-white border border-border rounded-sleek text-xs text-text-sub">
                            <Info size={14} />
                            {segment.reasoning}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {result.segments.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <div>
            <h4 className="font-display font-bold text-xl">Không phát hiện vấn đề</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Nội dung vượt qua bước sàng lọc. Các đoạn nghi ngờ không được liệt kê.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
