
export interface ExtractedSection {
  heading: string;
  content: string;
}

export interface ExtractionResult {
  title: string;
  sections: ExtractedSection[];
  sourceUrl: string;
  groundingUrls?: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
