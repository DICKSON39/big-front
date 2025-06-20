import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

interface Certificate{
  certificateId: number;
  id:number;
  certificate_url:string;
  course_id:number;
  message:string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
   private apiUrl = 'http://localhost:5000/api/v1/certificates'

  constructor(private http:HttpClient) { }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  uploadCertificate(courseData:FormData):Observable<Certificate>{
    return this.http.post<Certificate>(`${this.apiUrl}/upload`,courseData,{
      headers:this.getAuthHeaders()
    })
  }

  getCertificate():Observable<any>{
    return this.http.get(`${this.apiUrl}`,
      {
        headers: this.getAuthHeaders()
      }
    )
  }

  getUserCertificates(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`,{
      headers: this.getAuthHeaders()
    });
  }

  deleteCertificate(certificateId:number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${certificateId}`,
      {
        headers:this.getAuthHeaders()
      }
    )
  }

  getAllUserCerts(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/certificates/all`,{
    headers: this.getAuthHeaders()
  });
}



}
