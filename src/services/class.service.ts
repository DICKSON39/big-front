import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface Class {
  id: number;
  title: string;
  description: string; // Lowercase 'd'
  course_id: number;
  course_title: string;
  video_url: string | null; // assuming it's just a URL from Supabase
  course: any;
}

interface Video {
   id: number;
  title: string;
  url: string;
}

interface CreateClassResponse {
  message: string;
  class: Class;
}
@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = 'http://localhost:5000/api/v1/classes'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // 🔥 Accepts FormData instead of CreateClassPayload
  createClass(formData: FormData): Observable<CreateClassResponse> {
  return this.http.post<CreateClassResponse>(`${this.apiUrl}/create`, formData, {
    headers: this.getAuthHeaders(),
  }).pipe(
    catchError((err) => {
      console.error("Create class failed: ", err);
      return throwError(() => new Error('Class creation failed. Try again later.'));
    })
  );
}


deleteClass(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, {
    headers: this.getAuthHeaders()
  });
}

updateClass(id: number, data: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, data, {
    headers: this.getAuthHeaders()
  });
}

getAllClassesForAdmin() {
  return this.http.get<{ success: boolean; classes: any[] }>
  (`${this.apiUrl}/admin/classes`,{
    headers: this.getAuthHeaders()
  });
}


 getClassesByCourseId(courseId: number) {
  return this.http.get<{ classes: any[] }>(`http://localhost:5000/api/v1/classes/classes/course/${courseId}
    `,{
      headers: this.getAuthHeaders()
    });
}

}
