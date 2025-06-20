import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role_id: number;
  role_name: string;
  avatar_url?: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id?: number;
  role_name?: string;
  course_id?: number;
  enrolled_at?: string;
}

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

export interface PaginatedUsers {
  items: User[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  country_code?: number;
  date_of_birth?: Date;
}

export interface UpdateUserBackendResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/v1/users';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  getUsers(page: number, pageSize: number, searchTerm: string = ''): Observable<PaginatedUsers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.http.get<PaginatedUsers>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  updateProfile(userId: string, userData: UpdateUserRequest): Observable<UpdateUserBackendResponse> {
    return this.http
      .put<UpdateUserBackendResponse>(`${this.apiUrl}/users/${userId}`, userData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          if (response.user) {
            this.storeUser(response.user);
          }
        })
      );
  }

  // 🔍 Updated with optional search param
  getAllStudents(searchTerm: string = ''): Observable<{ students: Student[] }> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    return this.http.get<{ students: Student[] }>(`${this.apiUrl}/students`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  getStudentsWithEnrollments(searchTerm: string = ''): Observable<{ enrolledStudents: Student[] }> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    return this.http.get<{ enrolledStudents: Student[] }>(`${this.apiUrl}/enrolled/student`, {
      headers: this.getAuthHeaders(),
      params,
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

  // 🔐 Local storage helpers
  private storeToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}
