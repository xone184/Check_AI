import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";

// Fix for pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export async function parseFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "txt":
      return await file.text();
    case "docx":
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    case "pdf":
      const pdfBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    default:
      throw new Error("Unsupported file format. Please use .txt, .docx, or .pdf");
  }
}
