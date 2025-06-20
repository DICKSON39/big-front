import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;
  dropdownOpen = false;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe({
      next: (res) => {
        this.notifications = res || [];
        this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
      },
      error: () => {
        this.snackBar.open('Failed to load notifications', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notif = this.notifications.find((n) => n.id === notificationId);
        if (notif) notif.is_read = true;
        this.unreadCount = this.notifications.filter((n) => !n.is_read).length;
      },
      error: () => {
        this.snackBar.open('Failed to mark as read', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
