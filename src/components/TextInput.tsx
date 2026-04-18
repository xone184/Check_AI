import React, { useState, useRef } from 'react';
import { Upload, FileUp, X, AlertCircle } from 'lucide-react';
import { parseFile } from '../lib/fileParser';
import { getGroqScanCharCap } from '../lib/groq';
import { cn } from '../lib/utils';

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  onScan: (text: string) => void;
  disabled?: boolean;
}

export default function TextInput({ value, onChange, onScan, disabled }: TextInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const charCap = getGroqScanCharCap();
  const overCap = value.trim().length > charCap;

  const handleFile = async (file: File) => {
    try {
      setError(null);
      const extractedText = await parseFile(file);
      onChange(extractedText);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleScan = () => {
    if (value.trim().length < 50) {
      setError("Document must be at least 50 characters long for analysis.");
      return;
    }
    onScan(value);
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "relative min-h-[400px] rounded-card border border-border transition-all p-4",
          isDragging ? "border-primary bg-primary/5" : "bg-white",
          disabled && "opacity-50 pointer-events-none"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your text here or drag and drop a document..."
          className="w-full h-[350px] resize-none border-none focus:ring-0 text-slate-700 bg-transparent placeholder:text-slate-400"
        />
        
        <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs font-medium text-text-sub">
          {value.length > 0 && (
            <button 
              onClick={() => onChange('')}
              className="px-2 py-1 hover:bg-red-50 text-danger rounded transition-colors"
            >
              Clear
            </button>
          )}
          <span className={cn(overCap && "text-amber-700 font-semibold")}>
            {value.length.toLocaleString()} / ~{charCap.toLocaleString()} ký tự (Groq)
          </span>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-slate-100 rounded-sleek transition-colors text-text-sub"
            title="Upload Document"
          >
            <FileUp size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".txt,.docx,.pdf"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {value.length === 0 && !isDragging && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text-sub">
            <Upload size={48} className="mb-4 opacity-10" />
            <p className="text-lg font-bold text-text-main">Drop documents here</p>
            <p className="text-sm">Supports .pdf, .docx, .txt</p>
          </div>
        )}
      </div>

      {overCap && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-900 rounded-sleek text-sm border border-amber-100">
          <AlertCircle size={18} />
          Văn bản vượt ~{charCap.toLocaleString()} ký tự: lúc quét chỉ gửi phần đầu cho API (tránh lỗi
          413/TPM). Chia nhỏ tài liệu hoặc chỉnh VITE_GROQ_MAX_INPUT_CHARS nếu gói Groq cho phép.
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-danger rounded-sleek text-sm border border-red-100">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        onClick={handleScan}
        disabled={disabled || value.trim().length === 0}
        className="w-full py-4 bg-primary text-white font-bold rounded-sleek shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        Quét Đạo Văn
      </button>
    </div>
  );
}
