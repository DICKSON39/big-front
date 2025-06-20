// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http'; // Import HttpResponse
import { Router } from '@angular/router';
import {Observable, of, tap, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
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
  avatar_url?: string; // Optional avatar URL
  
}





export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role_id:number;

}



// NEW: Interface for backend response after profile update
export interface UpdateUserBackendResponse {
  message: string;
  user: User; // Backend should return the updated user object
}
// NEW: Interface for backend response after profile update

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:5000/api/v1/auth";
  private jwtHelper = new JwtHelperService();

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient, private router: Router) { }

  getUser(): Observable<User | null> {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) as User : null;
    return of(user);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserId(): Observable<string | null> {
    return this.getUser().pipe(
      map(user => user ? user.id : null)
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  public isTokenExpired(token: string): boolean {
    if (!token) {
      console.warn('isTokenExpired: No token provided or token is null/undefined.');
      return true;
    }
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Token parsing failed in isTokenExpired:', error);
      console.error('Attempted to parse token:', token); // Log the problematic token
      return true;
    }
  }

  private storeToken(token: string): void {
    console.log('AuthService - storeToken: Attempting to store token:', token);
    localStorage.setItem('access_token', token);
  }

  private storeUser(user: User): void {
    console.log('AuthService - storeUser: Storing user:', user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  register(userData: any): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response: RegistrationResponse) => {
          //console.log('AuthService - register response received:', response);
          if (response && response.accessToken) {
            //console.log('AuthService - register: accessToken found in response.');
            this.storeToken(response.accessToken);
            this.storeUser(response.user as User);
            if (response.user && response.user.id) {
              localStorage.setItem('userId', response.user.id);
              console.log('AuthService - userId stored:', response.user.id);
            }
          } else {
            //console.error('AuthService - register: No accessToken in response!', response);
            // Optionally, handle this error more explicitly, e.g., throw an error or clear state
          }
        }),
      );
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials, { observe: 'response' }) // Keep observe: 'response' for debugging
      .pipe(
        tap((httpResponse: HttpResponse<LoginResponse>) => { // Still type as HttpResponse for tap
          //console.log('AuthService - login: Full HTTP Response object received:', httpResponse);

          if (httpResponse.body) {
            const responseBody = httpResponse.body;
           // console.log('AuthService - login: Response body extracted (in tap):', responseBody);

            if (responseBody && responseBody.accessToken) {
              //console.log('AuthService - login: accessToken found in response body (in tap):', responseBody.accessToken);
              this.storeToken(responseBody.accessToken);
              this.storeUser(responseBody.user as User);
            } else {
              console.error('AuthService - login: accessToken MISSING or UNDEFINED in response body (in tap)!', responseBody);
              this.storeToken('');
            }
          } else {
            console.error('AuthService - login: HTTP Response body is NULL or UNDEFINED (in tap)!');
            this.storeToken('');
          }
        }),
        // --- ADD THIS MAP OPERATOR ---
        map(httpResponse => {
          if (!httpResponse.body) {
            console.error('AuthService - login: Mapping empty body. This should not happen if backend sends content.');
            throw new Error('No response body received from login.'); // Or handle as per your error strategy
          }
          return httpResponse.body; // Extract and return the actual LoginResponse
        })
        // --- END ADDED MAP OPERATOR ---
      );
  }

  logout(): void {
    this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
        },
      )
      .subscribe({
        next: (response) => {
          //console.log('Logged out successfully', response);
        },
        error: (error) => {
          console.error('Logout error', error);
        },
        complete: () => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId'); // Ensure userId is also cleared on logout
         // console.log('AuthService: Cleared localStorage tokens and user info.');
          this.router.navigate(['/']);
        },
      });
  }

  verifyOtp(userId: string, otp: string): Observable<any> {
    //console.log('AuthService - verifyOtp: Attempting to send:', { userId, otp });
    return this.http.post(`${this.apiUrl}/verify-otp`, { userId, otp });
  }

  resendOtp(userId: string): Observable<any> {
    //console.log('AuthService - resendOtp: Attempting to send:', { userId });
    return this.http.post(`${this.apiUrl}/resend-otp`, { userId });
  }

  requestPasswordReset(email: string): Observable<any> {
   // console.log('AuthService - requestPasswordReset: Attempting to send:', { email });
    return this.http.post(`${this.apiUrl}/request-reset-password`, { email }).pipe(
      tap(response => console.log('Password reset request successful:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Password reset request failed (backend):', error);
        return throwError(() => error);
      })
    );
  }

  verifyPasswordResetOtp(email: string, otp: string): Observable<any> {
    console.log('AuthService - verifyPasswordResetOtp: Attempting to send:', { email, otp });
    return this.http.post(`${this.apiUrl}/verify-password-reset-otp`, { email, otp }).pipe(
      tap(response => console.log('Password reset OTP verification successful:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Password reset OTP verification failed (backend):', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(email: string, newPassword: string, passwordResetToken: string): Observable<any> {
    //console.log('AuthService - resetPassword: Attempting to send:', { email, passwordResetToken }); // Don't log password
    return this.http.post(`${this.apiUrl}/reset/password`, { email, newPassword, passwordResetToken }).pipe(
      tap(response => console.log('Password reset successful:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Password reset failed (backend):', error);
        return throwError(() => error);
      })
    );
  }


  addUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role_name: string; // 'student', 'teacher', 'admin'
  }): Observable<any> {
    //console.log('AuthService - addUser: Attempting to add user:', userData.email, userData.role_name);
    return this.http.post(`${this.apiUrl}/admin/users`, userData, { headers: this.getAuthHeaders() }).pipe( // <-- ADDED HEADERS HERE
      tap(response => console.log('User added successfully (AuthService):', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to add user (AuthService):', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(userId: string, userData: UpdateUserRequest): Observable<UpdateUserBackendResponse> {
    // Assuming your backend has a PUT endpoint like /api/auth/v1/users/:userId
    return this.http.put<UpdateUserBackendResponse>(`http://localhost:5000/api/v1/users/users/${userId}`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        // If the backend returns the updated user, update localStorage
        if (response.user) {
          this.storeUser(response.user);
        }
      })
    );
  }
}
