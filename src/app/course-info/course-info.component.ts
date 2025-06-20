import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { PaymentService } from '../../services/payment.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrollmentService } from '../../services/enrollment.service';

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
}

@Component({
  selector: 'app-course-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-info.component.html',
  styleUrls: ['./course-info.component.css'],
})
export class CourseInfoComponent implements OnInit {
  courseId!: number;
  course!: Course;
  isLoading = true;
  errorMessage = '';

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
    private enrollmentService:EnrollmentService
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
    this.stripe = await loadStripe('pk_test_51RO0lO2cCqKNtuUREQ3BtS6covRzAQvM71uLNsgNBVTTBdzQASkCtgCwlnncCzhWHTpf2ICS7pORY64ONUPQYANP00jPXyi8FU');

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
    this.showPaymentModal = true;
    this.selectedPaymentMethod = 'stripe';

    // Wait a tick to ensure modal is in DOM
    setTimeout(() => {
      this.mountStripeCardElement();
    }, 0);
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

    this.paymentService.makePayment(this.courseId, this.course.price).subscribe({
      next: async (res) => {
        const clientSecret = res.clientSecret;

        const result = await this.stripe!.confirmCardPayment(clientSecret, {
          payment_method: { card: this.card! },
        });

        if (result.error) {
          console.error('Stripe Error:', result.error.message);
        } else if (result.paymentIntent?.status === 'succeeded') {
          this.paymentService.confirmPayment(this.courseId, result.paymentIntent.id).subscribe({
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

    this.paymentService.initiateMpesaPayment(this.courseId, this.phoneNumber).subscribe({
      next: (res) => {
        this.mpesaSuccess = true;
        this.paymentInProgress = false;
        this.closePaymentModal();
      },
      error: (err) => {
        console.error('M-Pesa Error:', err);
        this.paymentInProgress = false;
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
    }
  });
}
}
