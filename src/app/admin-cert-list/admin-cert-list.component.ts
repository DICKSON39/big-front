import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-admin-cert-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-cert-list.component.html',
  styleUrls: ['./admin-cert-list.component.css']
})
export class AdminCertListComponent implements OnInit {
  certs: any[] = [];
  isLoading = true;
  error = '';

  constructor(private certService: CertificateService) {}

  ngOnInit(): void {
    this.certService.getAllUserCerts().subscribe({
      next: (data) => {
        this.certs = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load certificates';
        this.isLoading = false;
      }
    });
  }
}

