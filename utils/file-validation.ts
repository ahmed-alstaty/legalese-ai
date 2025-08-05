export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: 'pdf' | 'docx';
}

export const ALLOWED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_FILE_SIZE = 100; // 100 bytes

export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File is too small or empty.',
    };
  }

  // Check file type
  const fileType = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
  if (!fileType) {
    return {
      isValid: false,
      error: 'Unsupported file type. Only PDF and DOCX files are allowed.',
    };
  }

  // Additional validation based on file extension
  const fileName = file.name.toLowerCase();
  if (fileType === 'pdf' && !fileName.endsWith('.pdf')) {
    return {
      isValid: false,
      error: 'File extension does not match MIME type. Expected .pdf file.',
    };
  }

  if (fileType === 'docx' && !fileName.endsWith('.docx')) {
    return {
      isValid: false,
      error: 'File extension does not match MIME type. Expected .docx file.',
    };
  }

  return {
    isValid: true,
    fileType,
  };
}

export function validateFileBuffer(buffer: Buffer, filename: string): FileValidationResult {
  // Check buffer size
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  if (buffer.length < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File is too small or empty.',
    };
  }

  // Check file signature (magic bytes)
  const fileName = filename.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    // PDF files start with %PDF-
    const pdfSignature = buffer.subarray(0, 5);
    if (pdfSignature.toString() !== '%PDF-') {
      return {
        isValid: false,
        error: 'Invalid PDF file format.',
      };
    }
    return {
      isValid: true,
      fileType: 'pdf',
    };
  }

  if (fileName.endsWith('.docx')) {
    // DOCX files are ZIP archives, check for ZIP signature
    const zipSignature = buffer.subarray(0, 4);
    const validZipSignatures = [
      Buffer.from([0x50, 0x4b, 0x03, 0x04]), // Standard ZIP
      Buffer.from([0x50, 0x4b, 0x05, 0x06]), // Empty ZIP
      Buffer.from([0x50, 0x4b, 0x07, 0x08]), // Spanned ZIP
    ];
    
    const isValidZip = validZipSignatures.some(sig => sig.equals(zipSignature));
    if (!isValidZip) {
      return {
        isValid: false,
        error: 'Invalid DOCX file format.',
      };
    }
    return {
      isValid: true,
      fileType: 'docx',
    };
  }

  return {
    isValid: false,
    error: 'Unsupported file type. Only PDF and DOCX files are allowed.',
  };
}

export function generateUniqueFilename(originalFilename: string, userId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')).replace(/[^a-zA-Z0-9-_]/g, '_');
  
  return `${userId}/${timestamp}_${randomSuffix}_${baseName}${extension}`;
}