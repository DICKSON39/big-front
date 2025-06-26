import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-certificate-list',
  standalone: true, // ← Add this if you're using standalone components
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.css'], // ✅ fixed here
})
export class CertificateListComponent {
  @Input() certificates: any[] = [];
  @Output() delete = new EventEmitter<number>();

  onDelete(certId: number): void {
    this.delete.emit(certId); // 🔥 this emits number, just what parent needs
  }

  downloadCertificate(url: string, courseTitle: string): void {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${courseTitle.replace(/\s+/g, '_')}_certificate.pdf`;
        a.click();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error('Download failed:', err);
        alert('❌ Failed to download certificate.');
      });
  }
}
