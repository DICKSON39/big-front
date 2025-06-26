import { Component, OnInit } from '@angular/core';
import { AdminStatsService } from '../../services/admin-stats.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.css'],
  imports: [CommonModule],
})
export class UserStatsComponent implements OnInit {
  stats: any = null;
  loading = true;
  error = '';

  constructor(private statsService: AdminStatsService) {}

  ngOnInit(): void {
    this.statsService.getMyStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading user stats:', err);
        this.error = 'Failed to load stats';
        this.loading = false;
      },
    });
  }
}
