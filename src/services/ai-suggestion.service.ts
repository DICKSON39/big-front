import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AiSuggestionResponse, Course } from '../app/models/ai-suggestion.model';

interface CareerSuggestionResponse {
  path?: {
    path_name: string;
    steps: string[];
  };
  matching_courses?: any[];
  message?: string;
  ask_quiz?: boolean;
  questions?: string[];
}


@Injectable({
  providedIn: 'root'
})
export class AiSuggestionService {

  private apiUrl = `https://school-online-backend.onrender.com/api/v1/ai`

  constructor(private http: HttpClient) {}


  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }


suggestCareerPath(payload: {
    user_id?: string;
    interests: string[];
    answers: Record<string, string>;
  }): Observable<AiSuggestionResponse> {
    return this.http.post<AiSuggestionResponse>(
      `${this.apiUrl}/suggest`,
      payload,{
      headers:this.getAuthHeaders()
    }
    );
  }


  getAllCourses(user_id: string) {
  return this.http.get<{ courses: Course[] }>(`${this.apiUrl}/ai/all-courses?user_id=${user_id}`,{
      headers:this.getAuthHeaders()
    });
}

saveChatHistory(payload: {
  user_id: string;
  from: 'user' | 'ai';
  message: string;
  path_name?: string;
  steps?: string[];
  courses?: Course[];
}) {
  return this.http.post(`${this.apiUrl}/ai/chat-history/save`, payload,{
      headers:this.getAuthHeaders()
    });
}

  getChatHistory(userId: string, limit: number = 10, offset: number = 0) {
  return this.http.get<{ messages: { from: string; message: string; timestamp?: string; [key: string]: any }[], totalCount: number }>(
    `${this.apiUrl}/ai/chat-history?user_id=${userId}&limit=${limit}&offset=${offset}`,{
      headers:this.getAuthHeaders()
    }
  );
}



}
