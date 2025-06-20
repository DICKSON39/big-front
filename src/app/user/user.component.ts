import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { NotificationComponent } from '../notification/notification.component';


interface Course {
  id: number;
  title: string;
  instructor: { first_name: string; last_name: string };
  price: number;
  image_url?: string;
  progress: number;                // Add this
  certificate_url?: string | null; 
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CurrencyPipe,NotificationComponent,],
  templateUrl: './user.component.html',

  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  userEmail: string | null = null;
  userRole: string | null = null;
  userAvatar = 'https://i.pravatar.cc/100';

  sidebarOpen = true;
  screenWidth: number;
  allCourses: Course[] = [];
  private userSub!: Subscription;


  constructor(
    private authService: AuthService,
    private router: Router,
    private courseService: CourseService
  ) {
    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.sidebarOpen = this.screenWidth > 768;
  }

  ngOnInit(): void {
    this.sidebarOpen = this.screenWidth > 768;

    this.userSub = this.authService.getUser().subscribe(
      (user: User | null) => {
        if (user) {
          this.userName = `${user.first_name} ${user.last_name}`;
          this.userEmail = user.email;
          this.userRole = user.role_name || user.role_name;
          this.userAvatar = user.avatar_url ?? this.userAvatar;
        } else {
          this.redirectToLogin();
        }
      },
      () => this.redirectToLogin()
    );

    // Fetch real courses
    this.courseService.getCourses(1, 6).subscribe({
      next: (res: any) => {
        this.allCourses = res.results.map((c: any) => ({
  id: +c.id,
  title: c.title,
  instructor: c.instructor,
  price: c.price,
  image_url: c.image_url,
  progress: c.progress, // <- must come from backend
  certificate_url: c.certificate_url // <- must come from backend
}));
;
      },
      error: () => {
        console.error('Failed to load courses');
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  redirectToLogin() {
    this.userName = this.userEmail = this.userRole = null;
    this.router.navigate(['/login']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
