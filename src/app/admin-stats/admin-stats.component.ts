// src/app/components/admin-stats.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatsService } from '../../services/admin-stats.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.css'],
})
export class AdminStatsComponent implements OnInit {
  stats: any = null;
  loading = true;
  error = '';

  constructor(private statsService: AdminStatsService) {}

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        this.error = 'Failed to load stats.';
        this.loading = false;
      },
    });
  }

  revenueMethodKeys(methods: Record<string, number>): string[] {
  return Object.keys(methods);
}

}
