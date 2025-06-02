
export interface Document {
  id: string;
  name: string;
  type: string; // e.g., 'pdf', 'txt', 'docx'
  content?: string; // Raw content, potentially truncated for AI processing
  originalLength?: number; // Original length of the document before truncation
  isTruncated?: boolean; // Flag indicating if the content was truncated
  status: 'pending' | 'analyzing' | 'indexing' | 'indexed' | 'error';
  uploadedAt: Date;
  analysisResult?: any; // Store result from documentContextAnalyzer
  indexingResult?: any; // Store result from intelligentIndexing
}

