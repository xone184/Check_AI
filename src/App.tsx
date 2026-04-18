import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Zap, Search, Loader2 } from 'lucide-react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import ResultDisplay from './components/ResultDisplay';
import { checkPlagiarism, PlagiarismResult } from './lib/groq';
import { getPublicAppOrigin } from './lib/publicOrigin';

type AppState = 'idle' | 'scanning' | 'results';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [documentText, setDocumentText] = useState('');
  const publicOrigin = getPublicAppOrigin();

  const handleApplyRewrite = (original: string, rewrite: string) => {
    setDocumentText(prev => prev.replace(original, rewrite));
  };

  const startScan = async (text: string) => {
    setDocumentText(text);
    setState('scanning');
    setResult(null);
    setProgress(0);
    
    // Simulation sequence to match the "Tầng 2 - Backend Queue" flow hints
    const steps = [
      { p: 10, t: "Initializing VeriScan engine..." },
      { p: 25, t: "Connected to Copyleaks API..." },
      { p: 40, t: "Scanning over 40 trillion web pages..." },
      { p: 60, t: "Analyzing academic journals and local archives..." },
      { p: 80, t: "AI Engine identifying patterns & generating rewrites..." },
      { p: 95, t: "Finalizing report..." }
    ];

    try {
      // Simulate backend delay/polling feel
      for (const step of steps) {
        setStatusText(step.t);
        const duration = Math.random() * 800 + 400;
        await new Promise(r => setTimeout(r, duration));
        setProgress(step.p);
      }

      const report = await checkPlagiarism(text);
      setResult(report);
      setProgress(100);
      setState('results');
    } catch (error) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
      alert(msg.length > 900 ? `${msg.slice(0, 900)}…` : msg);
      setState('idle');
    }
  };

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-hidden grid grid-cols-[240px_1fr_300px] gap-[1px] bg-border">
        {/* Sidebar */}
        <aside className="bg-sidebar p-5 flex flex-col gap-5 overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider font-bold text-text-sub">Lịch sử quét</div>
          <div className="space-y-2">
            <div className="p-3 bg-white border border-primary rounded-sleek bg-blue-50/30 cursor-pointer">
               <div className="text-[13px] font-bold text-text-main">KT-01.docx</div>
               <div className="text-[11px] text-text-sub mt-1">24% Trùng lặp • Vừa xong</div>
            </div>
            <div className="p-3 bg-white border border-border rounded-sleek hover:bg-slate-50 cursor-pointer">
               <div className="text-[13px] font-bold text-text-main">Thesis_Final.pdf</div>
               <div className="text-[11px] text-text-sub mt-1">5% Trùng lặp • 1 giờ trước</div>
            </div>
          </div>
          
          <div className="mt-auto border-t border-border pt-4">
             <div className="text-[11px] uppercase tracking-wider font-bold text-text-sub mb-2">Hỗ trợ File</div>
             <p className="text-[12px] text-text-sub leading-snug">Hỗ trợ .docx, .pdf, .txt lên tới 50,000 từ.</p>
          </div>
        </aside>

        {/* Center Editor */}
        <section className="bg-white flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-2 text-xs text-text-sub">
                <div className="pulse"></div>
                {state === 'scanning' ? statusText : "Đã kết nối backend • Live"}
             </div>
             <div className="flex gap-2">
                <button className="sleek-btn sleek-btn-outline !py-1 !px-2">Aa</button>
                <button className="sleek-btn sleek-btn-outline !py-1 !px-2">Dịch</button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {state === 'idle' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto space-y-8 h-full flex flex-col"
                >
                  <div className="text-center space-y-3 py-6">
                    <h2 className="text-3xl font-black text-text-main tracking-tight leading-tight">
                      Hệ thống Kiểm định <span className="text-primary">Văn bản</span>
                    </h2>
                    <p className="text-text-sub text-sm max-w-lg mx-auto leading-relaxed">
                      Quét và phân tích tính nguyên bản của nội dung dựa trên công nghệ 
                      AI tiên tiến nhất hiện nay.
                    </p>
                  </div>

                  <TextInput 
                    value={documentText}
                    onChange={setDocumentText}
                    onScan={startScan} 
                  />
                </motion.div>
              )}

              {state === 'scanning' && (
                <motion.div 
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-50 flex items-center justify-center relative overflow-hidden">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-full border-4 border-transparent border-t-primary rounded-full"
                      />
                      <Shield size={40} className="text-primary animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary"
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold text-text-sub uppercase tracking-widest">{statusText}</div>
                  </div>
                </motion.div>
              )}

              {state === 'results' && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <ResultDisplay 
                    result={result} 
                    onReset={() => setState('idle')} 
                    onApplyRewrite={handleApplyRewrite}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right Panel */}
        <aside className="bg-sidebar p-5 flex flex-col gap-6 overflow-y-auto border-l border-border">
          {state !== 'results' ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-text-sub">
               <Zap size={32} className="opacity-10" />
               <p className="text-xs leading-relaxed">Kết quả quét và gợi ý AI sẽ xuất hiện tại đây sau khi hoàn tất quy trình kiểm định.</p>
            </div>
          ) : (
            <>
              <div className="text-[11px] uppercase tracking-wider font-bold text-text-sub">Chi tiết báo cáo</div>
              <div className="space-y-4">
                 <div className="p-4 bg-white border border-primary/20 rounded-card shadow-sm text-center space-y-2">
                    <div>
                      <div className="text-2xl font-black text-danger">{result?.overallScore}%</div>
                      <div className="text-[10px] font-bold text-text-sub uppercase mt-1">Rủi ro trùng</div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="text-xl font-black text-success">{result?.safetyScore ?? Math.max(0, 100 - (result?.overallScore ?? 0))}%</div>
                      <div className="text-[10px] font-bold text-text-sub uppercase mt-1">Điểm an toàn</div>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <div className="text-[10px] font-bold text-text-sub uppercase tracking-tight">Thống kê nhanh</div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="p-3 bg-white rounded-sleek border border-border text-center">
                          <div className="text-xs font-bold text-text-main">{result?.segments.length}</div>
                          <div className="text-[9px] text-text-sub uppercase">Đoạn trùng</div>
                       </div>
                       <div className="p-3 bg-white rounded-sleek border border-border text-center">
                          <div className="text-xs font-bold text-success">Original</div>
                          <div className="text-[9px] text-text-sub uppercase">Trạng thái</div>
                       </div>
                    </div>
                 </div>
              </div>
            </>
          )}
        </aside>
      </main>

      <footer className="min-h-[40px] py-1.5 bg-white border-t border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 text-[11px] text-text-sub">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Trạng thái API: <span className="text-success font-bold">Sẵn sàng</span> • Rate Limit: 18/20 req/min</span>
          {publicOrigin ? (
            <span className="text-text-main/80 max-w-[min(100vw-3rem,32rem)] truncate" title={publicOrigin}>
              Miền công khai: <span className="font-mono text-[10px]">{publicOrigin}</span>
            </span>
          ) : null}
        </div>
        <div>Phiên bản 4.2.0 • VeriScan AI</div>
      </footer>
    </div>
  );
}

