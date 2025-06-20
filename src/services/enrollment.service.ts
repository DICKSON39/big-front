import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
export interface Course {
  id: number;
  name: string;
  enrolledAt: string;
}

export interface StudentWithCourses {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  courses: Course[];
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
 private apiUrl = 'https://school-online-backend.onrender.com/api/v1/enrollments'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  enrollStudent(data: { user_id: number; course_id: number }) {
  return this.http.post('https://school-online-backend.onrender.com/api/v1/enrollments/enroll', data,{
    headers: this.getAuthHeaders()
  });
}

 getEnrolledCourses(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/enrollments/${userId},`,{
      headers: this.getAuthHeaders()
    });
  }

  // Unenroll a student from a course
  unenrollStudent(user_id: number, course_id: number): Observable<any> {
  return this.http.request('delete', `${this.apiUrl}/users`, {
    headers: this.getAuthHeaders(),
    body: { user_id, course_id }
  });
}


  getAllEnrollments(): Observable<any> {
  return this.http.get(`${this.apiUrl}/enrollments`, {
    headers: this.getAuthHeaders(),
  });
}

 getStudentsWithCourses(searchTerm: string = ''): Observable<{ students: StudentWithCourses[] }> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    return this.http.get<{ students: StudentWithCourses[] }>(`${this.apiUrl}/enrolled/courses`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  checkEnrollment(userId: string, courseId: number): Observable<{ enrolled: boolean }> {
  return this.http.get<{ enrolled: boolean }>(
    `https://school-online-backend.onrender.com/api/v1/enrollments/check/${userId}/${courseId}`,
    { headers: this.getAuthHeaders() }
  );
}



}
