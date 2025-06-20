// src/app/services/payment.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:5000/api/v1/payment';

  constructor(private http: HttpClient) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  makePayment(courseId: number, amount: number) {
    return this.http.post<{ clientSecret: string }>(
      'http://localhost:5000/api/v1/payment/create-payment-intent',
      { courseId, amount },
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // New method for M-Pesa payment
  initiateMpesaPayment(courseId: number, phoneNumber: string) {
    return this.http.post<any>(
      `${this.apiUrl}/payment/make-payment`, // This hits your existing makePayment endpoint in the backend
      { courseId, paymentMethod: 'mpesa', phoneNumber },
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  confirmPayment(courseId: number, paymentIntentId: string): Observable<any> {
    const userId = localStorage.getItem('userId');
    return this.http.post(
      `${this.apiUrl}/${userId}/confirmPayment`,
      {
        courseId,
        paymentIntentId,
      },
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  getPayments(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/payments`, {
      headers: this.getAuthHeaders(),
    });
  }

  getStudentPayments(courseId?: number): Observable<any[]> {
    let url = `${this.apiUrl}/my-payments`;
    if (courseId) {
      url += `?courseId=${courseId}`;
    }

    return this.http.get<any[]>(url, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payment-info`, {
      headers: this.getAuthHeaders(),
    });
  }
}
