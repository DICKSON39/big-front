import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, Subject, Observable, of } from 'rxjs';
import { CourseService, StudentProgress } from '../../services/course.service';
import { ClassFormComponent } from '../class-form/class-form.component';
import { CourseFormComponent } from '../course-form/course-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CertificateService } from '../../services/certificate.service';
import { CertificateListComponent } from '../certificate-list/certificate-list.component';
import { CertificateComponent } from '../certificate/certificate.component';

interface TeacherStat {
  title: string;
  count: number;
}

interface UpcomingAssignment {
  id: number;
  title: string;
  className: string;
  dueDate: string;
  isOverdue: boolean;
}

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ClassFormComponent, CourseFormComponent, FormsModule, CertificateComponent, CertificateListComponent],
  templateUrl: './teacher.component.html',

  styleUrls: ['./teacher.component.css'],
})
export class TeacherComponent implements OnInit, OnDestroy {
  @Input() courseId: number | null = null;

  coursesWithClasses: any[] = [];
  openCourseIds: number[] = [];

  teacherCertificates: any[] = [];
  groupedCertificates: { [key: string]: any[] } = {};
  showModal = false;
  showCourseModal = false;
  showCertificateModal = false;
  sidebarOpen = true;
  selectedCourseId: number | null = null;
  teacherCourses: any[] = [];
  screenWidth: number;
  userName: string | null = null;
  userEmail: string | null = null;
  userRole: string | null = null;
  private userSubscription!: Subscription;
  private studentsProgressSubscription!: Subscription;

  userAvatar = 'https://i.pravatar.cc/100';

  teacherStats: TeacherStat[] = [
    { title: 'Total Classes', count: 12 },
    { title: 'Active Students', count: 150 },
    { title: 'Courses Created', count: 5 },
    { title: 'Pending Assignments', count: 8 }
  ];

  upcomingAssignments: UpcomingAssignment[] = [
    { id: 1, title: 'Algebra Homework #3', className: 'Mathematics Grade 7', dueDate: 'June 20, 2025', isOverdue: false },
    { id: 2, title: 'Biology Lab Report', className: 'Science Grade 8', dueDate: 'June 22, 2025', isOverdue: false },
    { id: 3, title: 'Poetry Analysis Essay', className: 'English Literature', dueDate: 'June 15, 2025', isOverdue: true },
  ];

  showStudentProgressModal: boolean = false;
  selectedCourseForStudents: any | null = null;
  studentsInSelectedCourse: StudentProgress[] = [];
  filteredStudentsInCourse: StudentProgress[] = [];
  isLoadingStudents: boolean = false;
  studentsErrorMessage: string | null = null;
  studentSearchTerm: string = '';

  private studentSearchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private courseService: CourseService,
    private snackBar: MatSnackBar,
    private certificateService: CertificateService
  ) {
    this.screenWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenWidth = window.innerWidth;
    this.sidebarOpen = this.screenWidth > 768;
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.getUser().subscribe({
      next: (user: any) => {
        if (user) {
          this.userName = `${user.first_name} ${user.last_name}`;
          this.userEmail = user.email;
          this.userRole = user.role_name || user.role;
        }
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
      }
    });

    this.loadCourses();

    this.courseService.getCoursesWithClasses().subscribe({
      next: (res) => {
        this.coursesWithClasses = res.data || [];
      },
      error: () => {
        this.snackBar.open('Failed to load courses with classes', 'Close', { duration: 3000 });
      }
    });

    this.studentsProgressSubscription = this.studentSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filterStudentsInCourse();
    });

    this.certificateService.getCertificate().subscribe(res => {
      this.teacherCertificates = res.certificate;
      this.groupCertificatesByCourse();
    });

   
  }

  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.studentsProgressSubscription) this.studentsProgressSubscription.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadCourses(): void {
    this.courseService.getCoursesByTeacher().subscribe({
      next: (res) => {
        this.teacherCourses = res.results;
        console.log("Loaded courses:", this.teacherCourses);
      },
      error: (err) => {
        console.error('Error loading teacher courses:', err);
        this.snackBar.open('❌ Failed to load your courses', 'Close', { duration: 3000 });
      }
    });
  }

  editCourse(course: any): void {
    this.selectedCourseId = course.id;
    this.showCourseModal = true;
  }

  deleteCourse(courseId: number): void {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.snackBar.open('✅ Course deleted successfully!', 'Close', { duration: 3000 });
          this.teacherCourses = this.teacherCourses.filter(c => c.id !== courseId);
          this.coursesWithClasses = this.coursesWithClasses.filter(c => c.id !== courseId);
        },
        error: (err) => {
          console.error('Error deleting course:', err);
          this.snackBar.open('❌ Failed to delete course', 'Close', { duration: 3000 });
        }
      });
    }
  }

 

  closeCourseModal(): void {
    this.showCourseModal = false;
    this.selectedCourseId = null;
    this.loadCourses();
  }

  toggleCourse(courseId: number): void {
    this.openCourseIds.includes(courseId)
      ? this.openCourseIds = this.openCourseIds.filter(id => id !== courseId)
      : this.openCourseIds.push(courseId);
  }

  isCourseOpen(courseId: number): boolean {
    return this.openCourseIds.includes(courseId);
  }

  viewStudentProgress(course: any): void {
    this.selectedCourseForStudents = course;
    this.showStudentProgressModal = true;

    if (course.id) {
      this.fetchStudentsInCourse(course.id);
    } else {
      this.studentsErrorMessage = "Course ID is missing for student progress view.";
      console.error(this.studentsErrorMessage);
    }
  }

  fetchStudentsInCourse(courseId: number): void {
    this.isLoadingStudents = true;
    this.studentsErrorMessage = null;
    this.studentsInSelectedCourse = [];
    this.filteredStudentsInCourse = [];
    this.studentSearchTerm = '';

    this.courseService.getStudentsInCourseWithProgress(String(courseId)).subscribe({
      next: (data: StudentProgress[]) => {
        this.studentsInSelectedCourse = data;
        this.filterStudentsInCourse();
        this.isLoadingStudents = false;
      },
      error: (err) => {
        console.error(`Error fetching students for course ${courseId}:`, err);
        this.studentsErrorMessage = 'Failed to load students for this course. Please try again.';
        this.isLoadingStudents = false;
      }
    });
  }

  filterStudentsInCourse(): void {
    if (!this.studentSearchTerm.trim()) {
      this.filteredStudentsInCourse = [...this.studentsInSelectedCourse];
      return;
    }
    const term = this.studentSearchTerm.toLowerCase();
    this.filteredStudentsInCourse = this.studentsInSelectedCourse.filter(s =>
      s.first_name.toLowerCase().includes(term) ||
      s.last_name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  }

  onStudentSearchInput(): void {
    this.studentSearchSubject.next(this.studentSearchTerm);
  }

  closeStudentProgressModal(): void {
    this.showStudentProgressModal = false;
    this.selectedCourseForStudents = null;
    this.studentsInSelectedCourse = [];
    this.filteredStudentsInCourse = [];
    this.studentSearchTerm = '';
    this.isLoadingStudents = false;
    this.studentsErrorMessage = null;
  }

  getProgressBarWidth(progress: number): number {
    return Math.min(100, Math.max(0, progress));
  }

  deleteCertificate(certificateId: number): void {
    console.log('Got cert ID to delete:', certificateId);
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.certificateService.deleteCertificate(certificateId).subscribe({
        next: () => {
          this.snackBar.open('✅ Certificate deleted!', 'Close', { duration: 3000 });
          this.teacherCertificates = this.teacherCertificates.filter(c => c.id !== certificateId);
          this.groupCertificatesByCourse();
        },
        error: (err) => {
          console.error('Failed to delete certificate:', err);
          this.snackBar.open('❌ Failed to delete certificate', 'Close', { duration: 3000 });
        }
      });
    }
  }

  groupCertificatesByCourse(): void {
    this.groupedCertificates = this.teacherCertificates.reduce((acc: any, cert: any) => {
      const courseName = cert.course_title || 'Unassigned';
      if (!acc[courseName]) acc[courseName] = [];
      acc[courseName].push(cert);
      return acc;
    }, {});
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  get certificateCourseTitles(): string[] {
  return Object.keys(this.groupedCertificates || {});
}

closeCertModal() {
    this.showCertificateModal = false;
   
  }
}