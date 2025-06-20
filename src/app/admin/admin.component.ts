// src/app/admin/admin.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { AdminEnrollStudentComponent } from '../admin-enroll-student/admin-enroll-student.component';
import { CertificateComponent } from '../certificate/certificate.component';
import { CertificateService } from '../../services/certificate.service';
import { CertificateListComponent } from '../certificate-list/certificate-list.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, CommonModule, AdminEnrollStudentComponent, CertificateComponent, CertificateListComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userAvatar = 'https://i.pravatar.cc/100';
  userEmail: string | null = null;
  userRole: string | null = null;
  private userSubscription!: Subscription;

  adminCertificates: any[] = [];
  groupedCertificates: { [key: string]: any[] } = {};

  showEnrollModal = false;
  showCertificateModal = false;

  stats = [
    { title: 'Total Users', count: 320 },
    { title: 'Courses', count: 45 },
    { title: 'Payments', count: 'KES 35,000' },
    { title: 'Certificates Issued', count: 87 }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private certificateService: CertificateService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCertificates();

    this.userSubscription = this.authService.getUser().subscribe(
      (user: User | null) => {
        if (user) {
          this.userName = user.first_name;
          this.userEmail = user.email;
          this.userRole = user.role_name;
        } else {
          this.userName = this.userEmail = this.userRole = null;
        }
      },
      (error) => {
        console.error('Error fetching user data for AdminComponent:', error);
        this.userName = this.userEmail = this.userRole = null;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openEnrollModal() {
    this.showEnrollModal = true;
  }

  closeEnrollModal() {
    this.showEnrollModal = false;
  }

  openCertModal() {
    this.showCertificateModal = true;
  }

  closeCertModal() {
    this.showCertificateModal = false;
  }

  deleteCertificate(certId: number): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.certificateService.deleteCertificate(certId).subscribe({
        next: () => {
          this.adminCertificates = this.adminCertificates.filter(c => c.id !== certId);
          this.groupCertificates();
          this.snackBar.open('✅ Certificate deleted!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Failed to delete certificate:', err);
          this.snackBar.open('❌ Failed to delete certificate', 'Close', { duration: 3000 });
        }
      });
    }
  }

  loadCertificates(): void {
    this.certificateService.getCertificate().subscribe(res => {
      this.adminCertificates = res.certificate || res.data || res;
      this.groupCertificates();
    });
  }

  groupCertificates(): void {
    this.groupedCertificates = this.adminCertificates.reduce((acc: any, cert: any) => {
      const courseName = cert.course_title || 'Unassigned';
      if (!acc[courseName]) acc[courseName] = [];
      acc[courseName].push(cert);
      return acc;
    }, {});
  }

  get certificateCourseTitles(): string[] {
    return Object.keys(this.groupedCertificates || {});
  }
}
