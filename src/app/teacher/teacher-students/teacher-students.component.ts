import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe,Location } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id?: number;
  role_name?: string;
  course_id?: number;
  enrolled_at?: string;
}

interface Course {
  id: number;
  name: string;
  enrolledAt: string;
}

interface StudentWithCourses {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  courses: Course[];
}

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule, AsyncPipe, DatePipe, FormsModule],
  templateUrl: './teacher-students.component.html',
  styleUrls: ['./teacher-students.component.css']
})
export class TeacherStudentsComponent implements OnInit {
  searchTerm: string = '';
  activeTab: 'all' | 'enrolled' | 'courses' = 'all';
  page = 1;
  itemsPerPage = 5;

  allStudents$!: Observable<Student[]>;
  studentsWithEnrollments$!: Observable<Student[]>;
  studentsWithCourses$!: Observable<StudentWithCourses[]>;

  loadingAllStudents = true;
  loadingStudentsWithEnrollments = true;
  loadingStudentsWithCourses = true;

  errorAllStudents: string | null = null;
  errorStudentsWithEnrollments: string | null = null;
  errorStudentsWithCourses: string | null = null;

  constructor(private userService: UserService,private location:Location) {}

  ngOnInit(): void {
    this.refreshAllData();
  }

  refreshAllData(): void {
    this.loadAllStudents();
    this.loadStudentsWithEnrollments();
    this.loadStudentsWithCourses();
  }

  onSearchChange(): void {
    this.page = 1;
    this.refreshAllData();
  }

  private loadAllStudents(): void {
    this.loadingAllStudents = true;
    this.errorAllStudents = null;
    this.allStudents$ = this.userService.getAllStudents(this.searchTerm).pipe(
      map(res => {
        this.loadingAllStudents = false;
        return res.students;
      }),
      catchError(() => {
        this.errorAllStudents = 'Failed to load all students.';
        this.loadingAllStudents = false;
        return of([]);
      })
    );
  }

  private loadStudentsWithEnrollments(): void {
    this.loadingStudentsWithEnrollments = true;
    this.errorStudentsWithEnrollments = null;
    this.studentsWithEnrollments$ = this.userService.getStudentsWithEnrollments(this.searchTerm).pipe(
      map(res => {
        this.loadingStudentsWithEnrollments = false;
        return res.enrolledStudents;
      }),
      catchError(() => {
        this.errorStudentsWithEnrollments = 'Failed to load enrolled students.';
        this.loadingStudentsWithEnrollments = false;
        return of([]);
      })
    );
  }

  private loadStudentsWithCourses(): void {
    this.loadingStudentsWithCourses = true;
    this.errorStudentsWithCourses = null;
    this.studentsWithCourses$ = this.userService.getStudentsWithCourses(this.searchTerm).pipe(
      map(res => {
        this.loadingStudentsWithCourses = false;
        return res.students;
      }),
      catchError(() => {
        this.errorStudentsWithCourses = 'Failed to load student-course data.';
        this.loadingStudentsWithCourses = false;
        return of([]);
      })
    );
  }

  setTab(tab: 'all' | 'enrolled' | 'courses') {
    this.activeTab = tab;
    this.page = 1;
  }

  paginate<T>(items: T[]): T[] {
    const start = (this.page - 1) * this.itemsPerPage;
    return items.slice(start, start + this.itemsPerPage);
  }

  goBack():void{
    this.location.back();
  }
}
