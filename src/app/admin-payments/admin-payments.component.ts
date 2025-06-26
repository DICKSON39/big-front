import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-admin-payments',

  imports: [CommonModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.css',
})
export class AdminPaymentsComponent implements OnInit {
  paymentDetails: any[] = [];
  isLoading = true;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.fetchPayments();
  }

  fetchPayments(): void {
    this.paymentService.getAllPayments().subscribe({
      next: (res) => {
        this.paymentDetails = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load payments', err);
        this.isLoading = false;
      },
    });
  }
}
