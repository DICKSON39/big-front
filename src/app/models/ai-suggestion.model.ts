export interface AiCareerPath {
  path_name: string;
  steps: string[];
}

export interface Course {
  id: number | string; // Backend sometimes sends it as string, be flexible
  title: string;
  description: string;
  image_url?: string;
  duration?: string;
  price?: number;
  category?: string;
}
export interface AiSuggestionResponse {
  path?: AiCareerPath;
  matching_courses?: Course[];
  message?: string;
  ask_quiz?: boolean;
  questions?: string[];
  fallback?: boolean;
  suggested_courses?: Course[];
}
