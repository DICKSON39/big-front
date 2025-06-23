export interface AiCareerPath {
  path_name: string;
  steps: string[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  duration?: string;
  price?: number;
  category?:string;
}

export interface AiSuggestionResponse {
  path?: AiCareerPath;
  matching_courses?: Course[];
  message?: string;
  ask_quiz?: boolean;
  questions?: string[];
}
