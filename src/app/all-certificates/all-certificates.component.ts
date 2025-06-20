import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CertificateService } from '../../services/certificate.service'; // Create this
import { take } from 'rxjs';

@Component({
  selector: 'app-all-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-certificates.component.html',
  styleUrls: ['./all-certificates.component.css'],
})
export class AllCertificatesComponent implements OnInit {
  certificates: any[] = [];
  isLoading = true;
  errorMessage = '';
error: any;
certs: any;

  constructor(
    private authService: AuthService,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
  this.authService.getUserId().pipe(take(1)).subscribe({
    next: (userId) => {
      if (!userId) {
        this.errorMessage = 'Unable to fetch user info';
        this.isLoading = false;
        return;
      }

      this.fetchCerts(userId); // now safe ✅
    },
    error: () => {
      this.errorMessage = 'Unable to fetch user info';
      this.isLoading = false;
    }
  });
}


  fetchCerts(userId: string): void {
    this.certificateService.getUserCertificates(userId).subscribe({
      next: (res) => {
        this.certificates = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load certificates';
        this.isLoading = false;
      }
    });
  }
}
