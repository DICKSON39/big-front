
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  private apiUrl = 'https://school-online-backend.onrender.com/api/v1/progress'; // Update with your actual API URL
 private as= ``
  constructor(private http: HttpClient) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  markClassComplete(userId: any, classId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/progress/complete`, {
    user_id: userId,
    class_id: classId,
  }, {
    headers: this.getAuthHeaders()
  });
}

 getCoursesWithClasses(userId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/progress/${userId}/courses`, {
      headers:this.getAuthHeaders()
    });
  }

  getCoursesWithProgress(userId: string | number, courseId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/user-progress/${userId}/${courseId}`, {
      headers:this.getAuthHeaders()
    });
  }

}
