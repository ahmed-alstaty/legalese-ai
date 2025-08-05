// Wrapper for pdf-parse to handle the test file issue
import type { Buffer } from 'buffer';

interface PDFData {
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
  version: string;
}

export async function parsePDF(dataBuffer: Buffer): Promise<PDFData> {
  // Dynamic import to avoid build issues
  const pdfjsLib = await import('pdfjs-dist');
  
  // Disable worker to avoid path issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = false as any;
  
  const data = await pdfjsLib.getDocument({
    data: dataBuffer,
    useSystemFonts: true,
  }).promise;

  let text = '';
  const numPages = data.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await data.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    text += pageText + '\n';
  }

  return {
    numpages: numPages,
    numrender: numPages,
    info: {},
    metadata: {},
    text: text,
    version: '1.0.0'
  };
}

export default parsePDF;