// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

interface RegistrationResponse {
  message: string;
  user: any;
  accessToken: string;
}

interface LoginResponse {
  message: string;
  user: any;
  accessToken: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role_id: number;
  role_name: string;
  avatar_url?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role_id: number;
}

export interface UpdateUserBackendResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://school-online-backend.onrender.com/api/v1/auth';
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getUser(): Observable<User | null> {
    const userString = localStorage.getItem('user');
    const user = userString ? (JSON.parse(userString) as User) : null;
    return of(user);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserId(): Observable<string | null> {
    return this.getUser().pipe(map((user) => (user ? user.id : null)));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  public isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch {
      return true;
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  register(userData: any): Observable<RegistrationResponse> {
    return this.http
      .post<RegistrationResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response) => {
          if (response?.accessToken) {
            this.storeToken(response.accessToken);
            this.storeUser(response.user);
            if (response.user?.id) {
              localStorage.setItem('userId', response.user.id);
            }
          }
        }),
      );
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials, {
        observe: 'response',
      })
      .pipe(
        tap((httpResponse: HttpResponse<LoginResponse>) => {
          const responseBody = httpResponse.body;
          if (responseBody?.accessToken) {
            this.storeToken(responseBody.accessToken);
            this.storeUser(responseBody.user);
          } else {
            this.storeToken('');
          }
        }),
        map((httpResponse) => {
          if (!httpResponse.body)
            throw new Error('No response body received from login.');
          return httpResponse.body;
        }),
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        complete: () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          this.router.navigate(['/']);
        },
      });
  }

  verifyOtp(userId: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { userId, otp });
  }

  resendOtp(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-otp`, { userId });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/request-reset-password`, { email })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }

  verifyPasswordResetOtp(email: string, otp: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/verify-password-reset-otp`, { email, otp })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }

  resetPassword(
    email: string,
    newPassword: string,
    passwordResetToken: string,
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/reset/password`, {
        email,
        newPassword,
        passwordResetToken,
      })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }

  addUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role_name: string;
  }): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/admin/users`, userData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }

  updateProfile(
    userId: string,
    userData: UpdateUserRequest,
  ): Observable<UpdateUserBackendResponse> {
    return this.http
      .put<UpdateUserBackendResponse>(
        `https://school-online-backend.onrender.com/api/v1/users/users/${userId}`,
        userData,
        { headers: this.getAuthHeaders() },
      )
      .pipe(
        tap((response) => {
          if (response.user) {
            this.storeUser(response.user);
          }
        }),
      );
  }
}
