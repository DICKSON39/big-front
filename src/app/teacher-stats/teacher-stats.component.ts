// 📁 src/app/components/teacher-stats/teacher-stats.component.ts

import { Component, OnInit } from '@angular/core';

import { AdminStatsService } from '../../services/admin-stats.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-stats',
  templateUrl: './teacher-stats.component.html',
  styleUrls: ['./teacher-stats.component.css'],
  imports: [CommonModule]
})
export class TeacherStatsComponent implements OnInit {
  stats: any = {};

  constructor(private statsService:AdminStatsService) {}

  ngOnInit(): void {
    this.statsService.getTeacherStats().subscribe({
      next: (res) => {
        console.log("Teacher Stats 🚀", res);

        this.stats = res;
      },
      error: (err) => {
        console.error('❌ Failed to fetch teacher stats:', err);
      }
    });
  }
}
