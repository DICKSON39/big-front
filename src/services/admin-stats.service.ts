import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {

   private baseUrl = 'https://school-online-backend.onrender.com/api/v1/admin';
  constructor(private http: HttpClient) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }


  
  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  getMyStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }


  getTeacherStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/teacher`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  
  getTrendingFallbackTopics():Observable<any>{
    return this.http.get(`${this.baseUrl}/ai/fallback-trends`,
      {
        headers: this.getAuthHeaders()
      }
    );

  }

  
}
