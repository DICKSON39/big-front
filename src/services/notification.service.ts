import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:5000/api/v1/progress'

  constructor(private http:HttpClient) { }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
getUserNotifications(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/notifications`, {
    headers: this.getAuthHeaders()
  });
}

markAsRead(notificationId: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {}, {
    headers: this.getAuthHeaders()
  });
}



}
