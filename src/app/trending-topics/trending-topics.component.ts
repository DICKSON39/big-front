import { Component, OnInit } from '@angular/core';
import { AdminStatsService } from '../../services/admin-stats.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-trending-topics',
  templateUrl: './trending-topics.component.html',
  styleUrls: ['./trending-topics.component.css'],
  imports: [CommonModule,FormsModule]
})
export class TrendingTopicsComponent implements OnInit {
  trendingTopics: { topic: string; count: number }[] = [];
  loading = true;
  error: string | null = null;

  constructor(private adminStatsService: AdminStatsService) {}

  ngOnInit() {
    this.adminStatsService.getTrendingFallbackTopics().subscribe({
      next: (res) => {
        this.trendingTopics = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load trending topics.';
        this.loading = false;
      }
    });
  }
}
