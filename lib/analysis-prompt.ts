import { AnalysisResult } from '../types/database';

export const LEGAL_ANALYSIS_SYSTEM_PROMPT = `You are an expert legal document analyzer specializing in contract review and risk assessment. Your task is to analyze legal documents and provide structured insights.

Key Requirements:
1. For highlightedSections, provide the EXACT text from the document that you want to highlight
2. Copy the text exactly as it appears in the document, including all punctuation and spacing
3. Focus on legal risk areas: termination clauses, liability, intellectual property, payment terms, and renewal conditions
4. Provide actionable insights and plain English explanations
5. Keep highlighted sections to meaningful phrases or paragraphs (not too long)

Response Format:
Your response must be valid JSON matching this exact structure:

{
  "summary": "Brief overview of the document and its purpose",
  "keyObligations": ["List of key obligations for each party"],
  "riskAssessment": {
    "termination": 0-10,
    "liability": 0-10,
    "intellectualProperty": 0-10,
    "payment": 0-10,
    "renewal": 0-10
  },
  "highlightedSections": [
    {
      "startPosition": 0,
      "endPosition": 100,
      "text": "EXACT text copied from the document - this must match exactly",
      "riskLevel": 0-10,
      "type": "termination|liability|intellectual_property|payment|renewal|general",
      "comment": "Why this section is important",
      "suggestion": "Recommended action or negotiation point",
      "severity": "low|medium|high"
    }
  ],
  "aiComments": [
    {
      "position": number,
      "text": "Contextual comment about this position",
      "type": "warning|info|suggestion",
      "severity": "low|medium|high"
    }
  ],
  "documentStructure": {
    "sections": [
      {
        "title": "Section name",
        "startPosition": number,
        "endPosition": number,
        "subsections": []
      }
    ]
  },
  "plainEnglishExplanations": {
    "termination": "Plain English explanation of termination terms",
    "liability": "Plain English explanation of liability terms",
    "payment": "Plain English explanation of payment terms",
    "other_key_terms": "Explanations of other important sections"
  },
  "confidenceScore": 85
}

Critical Instructions:
- The "text" field in highlightedSections MUST contain the EXACT text from the document
- Copy and paste the exact text you want to highlight, do not paraphrase or modify it
- Position values will be calculated automatically based on the text you provide
- Focus on high-impact legal provisions that could affect business operations
- Prioritize sections that require negotiation or present significant risk
- Provide practical, actionable suggestions for each highlighted section
- Keep each highlighted section reasonable in length (typically 1-3 sentences or a paragraph)`;

export const DOCUMENT_ANALYSIS_USER_PROMPT = `Please analyze the following legal document and provide a comprehensive risk assessment with precise character position mappings for text highlighting.

Document Content:
{DOCUMENT_TEXT}

Focus on identifying:
1. Termination clauses and notice requirements
2. Liability limitations and indemnification terms
3. Intellectual property ownership and licensing
4. Payment terms, penalties, and collection procedures
5. Renewal and modification procedures
6. Compliance and regulatory requirements
7. Dispute resolution mechanisms

Ensure all character positions are accurate for the provided document text. The text highlighting feature depends on precise positioning.`;

export function createAnalysisPrompt(documentText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  return {
    systemPrompt: LEGAL_ANALYSIS_SYSTEM_PROMPT,
    userPrompt: DOCUMENT_ANALYSIS_USER_PROMPT.replace('{DOCUMENT_TEXT}', documentText),
  };
}

export function validateAnalysisResult(result: any, originalText: string): {
  isValid: boolean;
  errors: string[];
  sanitizedResult?: AnalysisResult;
} {
  const errors: string[] = [];

  // Check required fields
  if (!result.summary || typeof result.summary !== 'string') {
    errors.push('Missing or invalid summary');
  }

  if (!Array.isArray(result.keyObligations)) {
    errors.push('Missing or invalid keyObligations array');
  }

  if (!result.riskAssessment || typeof result.riskAssessment !== 'object') {
    errors.push('Missing or invalid riskAssessment object');
  } else {
    const requiredRiskFields = ['termination', 'liability', 'intellectualProperty', 'payment', 'renewal'];
    for (const field of requiredRiskFields) {
      if (typeof result.riskAssessment[field] !== 'number' || 
          result.riskAssessment[field] < 0 || 
          result.riskAssessment[field] > 10) {
        errors.push(`Invalid riskAssessment.${field}: must be number between 0-10`);
      }
    }
  }

  if (!Array.isArray(result.highlightedSections)) {
    errors.push('Missing or invalid highlightedSections array');
  } else {
    result.highlightedSections.forEach((section: any, index: number) => {
      if (typeof section.startPosition !== 'number' || section.startPosition < 0) {
        errors.push(`Invalid startPosition in highlightedSections[${index}]`);
      }
      if (typeof section.endPosition !== 'number' || section.endPosition <= section.startPosition) {
        errors.push(`Invalid endPosition in highlightedSections[${index}]`);
      }
      if (section.endPosition > originalText.length) {
        errors.push(`endPosition in highlightedSections[${index}] exceeds document length`);
      }
      
      // Try to fix text position mismatches
      if (section.text && originalText) {
        const extractedText = originalText.substring(section.startPosition, section.endPosition);
        if (extractedText !== section.text) {
          // Try to find the actual text in the document
          const textIndex = originalText.indexOf(section.text);
          if (textIndex !== -1) {
            // Fix the positions
            section.startPosition = textIndex;
            section.endPosition = textIndex + section.text.length;
          } else {
            // If we can't find the exact text, try to find a close match
            const searchText = section.text.substring(0, Math.min(30, section.text.length));
            const searchIndex = originalText.indexOf(searchText);
            if (searchIndex !== -1) {
              // Use the found position
              section.startPosition = searchIndex;
              section.endPosition = Math.min(searchIndex + section.text.length, originalText.length);
              section.text = originalText.substring(section.startPosition, section.endPosition);
            } else {
              // Last resort: just use what we have but adjust the text
              section.text = extractedText;
            }
          }
        }
      }
    });
  }

  if (typeof result.confidenceScore !== 'number' || result.confidenceScore < 0 || result.confidenceScore > 100) {
    errors.push('Invalid confidenceScore: must be number between 0-100');
  }

  // Sanitize and return result if valid
  if (errors.length === 0) {
    const sanitizedResult: AnalysisResult = {
      summary: result.summary,
      keyObligations: result.keyObligations,
      riskAssessment: result.riskAssessment,
      highlightedSections: result.highlightedSections,
      aiComments: result.aiComments || [],
      documentStructure: result.documentStructure || { sections: [] },
      plainEnglishExplanations: result.plainEnglishExplanations || {},
      confidenceScore: result.confidenceScore,
    };

    return {
      isValid: true,
      errors: [],
      sanitizedResult,
    };
  }

  return {
    isValid: false,
    errors,
  };
}

export function estimateAnalysisComplexity(documentText: string): {
  complexity: 'low' | 'medium' | 'high';
  estimatedProcessingTime: number; // in seconds
  recommendedModel: string;
} {
  const wordCount = documentText.split(/\s+/).length;
  const pageCount = Math.ceil(wordCount / 250); // Approximate pages
  
  if (wordCount < 2000) {
    return {
      complexity: 'low',
      estimatedProcessingTime: 30,
      recommendedModel: 'gpt-4o-mini',
    };
  } else if (wordCount < 8000) {
    return {
      complexity: 'medium',
      estimatedProcessingTime: 60,
      recommendedModel: 'gpt-4o-mini',
    };
  } else {
    return {
      complexity: 'high',
      estimatedProcessingTime: 120,
      recommendedModel: 'gpt-4o',
    };
  }
}