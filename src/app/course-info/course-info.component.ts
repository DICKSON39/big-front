import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { PaymentService } from '../../services/payment.service';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../services/enrollment.service';
import { ModalComponent } from '../modal/modal.component';

export interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  duration: string;
  price: number;
  created_at?: string;
  updated_at?: string;
  teacher_id?: number;
  instructor?: {
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
  };
  classes?: {
    id: number;
    title: string;
    description: string;
    video_url: string;
    created_by: number;
  }[];
  classCount?: number; // <-- Add this
}

@Component({
  selector: 'app-course-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './course-info.component.html',
  styleUrls: ['./course-info.component.css'],
})
export class CourseInfoComponent implements OnInit {
  courseId!: number;
  course!: Course;
  isLoading = true;
  errorMessage = '';

  modalMessage = '';
  showModal = false;
  showConfirmButtons = true;

  // Payment states
  paymentInProgress = false;
  stripeSuccess = false;
  mpesaSuccess = false;
  phoneNumber: string = '';
  alreadyEnrolled: boolean = false;

  // Modal state
  showPaymentModal = false;
  selectedPaymentMethod: 'stripe' | 'mpesa' = 'stripe';

  // Stripe
  stripe!: Stripe | null;
  elements!: StripeElements | null;
  card!: StripeCardElement | null;
  userId!: string;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private paymentService: PaymentService,
    private enrollmentService: EnrollmentService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.courseId) {
      this.fetchCourseDetails(this.courseId);
    } else {
      this.errorMessage = 'Invalid course ID.';
      this.isLoading = false;
    }

    // Load Stripe
    this.stripe = await loadStripe(
      'pk_test_51RO0lO2cCqKNtuUREQ3BtS6covRzAQvM71uLNsgNBVTTBdzQASkCtgCwlnncCzhWHTpf2ICS7pORY64ONUPQYANP00jPXyi8FU',
    );

    if (this.userId && this.courseId) {
      this.checkEnrollment(this.userId, this.courseId);
    }
  }

  fetchCourseDetails(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (data) => {
        this.course = data?.course || data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load course.';
        this.isLoading = false;
      },
    });
  }

  openPaymentModal(): void {
    this.modalMessage = `Pay KES ${this.course.price} for ${this.course.title}?`;
    this.showConfirmButtons = true;
    this.showModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;

    // Optional: unmount Stripe card
    if (this.card) {
      this.card.unmount();
      this.card = null;
    }
  }

  async mountStripeCardElement(): Promise<void> {
    if (!this.stripe) return;

    if (!this.elements) {
      this.elements = this.stripe.elements();
    }

    if (this.card) {
      this.card.unmount(); // Just call it — it's safe
    }

    this.card = this.elements.create('card');
    this.card.mount('#card-element');
  }

  async handleStripePayment(): Promise<void> {
    if (!this.stripe || !this.card) {
      alert('Stripe not fully loaded');
      return;
    }

    this.paymentInProgress = true;

    this.paymentService
      .makePayment(this.courseId, this.course.price)
      .subscribe({
        next: async (res) => {
          const clientSecret = res.clientSecret;

          const result = await this.stripe!.confirmCardPayment(clientSecret, {
            payment_method: { card: this.card! },
          });

          if (result.error) {
            console.error('Stripe Error:', result.error.message);
          } else if (result.paymentIntent?.status === 'succeeded') {
            this.paymentService
              .confirmPayment(this.courseId, result.paymentIntent.id)
              .subscribe({
                next: () => {
                  this.stripeSuccess = true;
                  this.paymentInProgress = false;
                  this.closePaymentModal();
                },
                error: (err) => {
                  console.error('Confirm Payment Error:', err);
                  this.paymentInProgress = false;
                },
              });
          }
        },
        error: (err) => {
          console.error('Stripe Init Error:', err);
          this.paymentInProgress = false;
        },
      });
  }

  handleMpesaPayment(): void {
    if (!this.phoneNumber) {
      alert('Please enter your phone number');
      return;
    }

    this.paymentInProgress = true;

    this.paymentService
      .initiateMpesaPayment(this.courseId, this.phoneNumber)
      .subscribe({
        next: (res) => {
          this.mpesaSuccess = true;
          this.paymentInProgress = false;
          this.closePaymentModal();
        },
        error: (err) => {
          console.error('M-Pesa Error:', err);
          this.paymentInProgress = false;
          this.modalMessage = 'M-Pesa payment failed. Please try again.';
          this.showConfirmButtons = false;
          this.showModal = true;
        },
      });
  }

  checkEnrollment(userId: string, courseId: number): void {
    this.enrollmentService.checkEnrollment(userId, courseId).subscribe({
      next: (res) => {
        this.alreadyEnrolled = res.enrolled;
      },
      error: (err) => {
        console.error('Error checking enrollment:', err);
      },
    });
  }

  openStripeForm(): void {
    this.showPaymentModal = true;

    setTimeout(() => {
      this.mountStripeCardElement();
    }, 0);
  }

  onModalConfirm(): void {
    this.showModal = false;

    if (this.selectedPaymentMethod === 'stripe') {
      this.openStripeForm(); // open and mount card element
    } else if (this.selectedPaymentMethod === 'mpesa') {
      this.handleMpesaPayment();
    }
  }

  onModalCancel(): void {
    this.showModal = false;
  }
}
