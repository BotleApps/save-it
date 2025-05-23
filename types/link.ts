export interface Link {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  category: string | null;
  createdAt: string;
  status: 'unread' | 'reading' | 'completed';
  readingProgress: number;
  estimatedReadTime: number | null;
  note: string | null;
  groups: string[];
  prompt: string | null;
  summary: string | null;
  response: string | null;
}

export interface LinkPreview {
  title: string;
  description: string | null;
  imageUrl: string | null;
