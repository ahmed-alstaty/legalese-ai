import mammoth from 'mammoth';

export interface DocumentParseResult {
  text: string;
  metadata: {
    pages?: number;
    wordCount: number;
    characterCount: number;
    paragraphs: number;
  };
  structure?: {
    sections: DocumentSection[];
  };
}

export interface DocumentSection {
  title: string;
  startPosition: number;
  endPosition: number;
  level: number;
  subsections: DocumentSection[];
}

export interface ParsedDocument {
  content: string;
  metadata: DocumentParseResult['metadata'];
  structure: DocumentSection[];
}

export async function parsePDF(buffer: Buffer): Promise<DocumentParseResult> {
  try {
    // Dynamic import to avoid build issues
    const pdf = (await import('pdf-parse')).default;
    const data = await pdf(buffer, {
      // Preserve whitespace and formatting
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    });

    const text = data.text;
    const structure = extractStructureFromText(text);

    return {
      text,
      metadata: {
        pages: data.numpages,
        wordCount: countWords(text),
        characterCount: text.length,
        paragraphs: countParagraphs(text),
      },
      structure: {
        sections: structure,
      },
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseDOCX(buffer: Buffer): Promise<DocumentParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const structure = extractStructureFromText(text);

    return {
      text,
      metadata: {
        wordCount: countWords(text),
        characterCount: text.length,
        paragraphs: countParagraphs(text),
      },
      structure: {
        sections: structure,
      },
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseDocument(buffer: Buffer, fileType: 'pdf' | 'docx'): Promise<DocumentParseResult> {
  switch (fileType) {
    case 'pdf':
      return parsePDF(buffer);
    case 'docx':
      return parseDOCX(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
}

function extractStructureFromText(text: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = text.split('\n');
  
  let currentPosition = 0;
  let sectionStack: DocumentSection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineWithNewline = lines[i] + '\n';
    
    if (line.length === 0) {
      currentPosition += lineWithNewline.length;
      continue;
    }

    // Detect potential section headers
    const headerLevel = detectHeaderLevel(line);
    
    if (headerLevel > 0) {
      // Close sections at higher or equal levels
      while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= headerLevel) {
        const closingSection = sectionStack.pop()!;
        closingSection.endPosition = currentPosition;
      }

      const section: DocumentSection = {
        title: line,
        startPosition: currentPosition,
        endPosition: currentPosition + lineWithNewline.length,
        level: headerLevel,
        subsections: [],
      };

      if (sectionStack.length === 0) {
        sections.push(section);
      } else {
        sectionStack[sectionStack.length - 1].subsections.push(section);
      }

      sectionStack.push(section);
    }

    currentPosition += lineWithNewline.length;
  }

  // Close remaining sections
  sectionStack.forEach(section => {
    section.endPosition = currentPosition;
  });

  return sections;
}

function detectHeaderLevel(line: string): number {
  // Remove leading/trailing whitespace
  const trimmed = line.trim();
  
  if (trimmed.length === 0) return 0;

  // Pattern 1: All caps with minimum length (likely a header)
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /^[A-Z\s\d\.,-]+$/.test(trimmed)) {
    return 1;
  }

  // Pattern 2: Title case with specific patterns
  if (/^[A-Z][a-z].*[^.]$/.test(trimmed) && trimmed.length < 100) {
    // Check for common header indicators
    if (/^(ARTICLE|SECTION|CHAPTER|PART|SCHEDULE|EXHIBIT|APPENDIX)\s+/i.test(trimmed)) {
      return 1;
    }
    if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
      return 2;
    }
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmed)) {
      return 3;
    }
  }

  // Pattern 3: Numbered sections
  if (/^\d+\.\d+/.test(trimmed)) {
    const dots = (trimmed.match(/\./g) || []).length;
    return Math.min(dots + 1, 4);
  }

  // Pattern 4: Roman numerals
  if (/^[IVX]+\.\s+/.test(trimmed)) {
    return 2;
  }

  // Pattern 5: Letter enumeration
  if (/^[A-Z]\.\s+/.test(trimmed)) {
    return 3;
  }

  return 0;
}

export function findTextPosition(
  fullText: string,
  searchText: string,
  occurrence: number = 1
): { start: number; end: number } | null {
  let index = -1;
  let count = 0;
  
  while (count < occurrence) {
    index = fullText.indexOf(searchText, index + 1);
    if (index === -1) {
      return null;
    }
    count++;
  }
  
  return {
    start: index,
    end: index + searchText.length,
  };
}

export function extractTextAroundPosition(
  fullText: string,
  position: number,
  contextLength: number = 200
): {
  before: string;
  target: string;
  after: string;
  absoluteStart: number;
  absoluteEnd: number;
} {
  const start = Math.max(0, position - contextLength);
  const end = Math.min(fullText.length, position + contextLength);
  
  return {
    before: fullText.substring(start, position),
    target: fullText.charAt(position),
    after: fullText.substring(position + 1, end),
    absoluteStart: start,
    absoluteEnd: end,
  };
}