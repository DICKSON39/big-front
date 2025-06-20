import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


export interface Course {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  duration: string;
  price: number;
  created_at?: string;
  updated_at?: string;
  teacher_id?: number;
  instructor?: {
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
  };
  teacherId: number;
  teacherName: string;
  roleName: string;
  course:Course
  
  
}


export interface StudentProgress {
  user_id: string; // The ID of the student
  first_name: string;
  last_name: string;
  email: string;
  progress: number; // The percentage progress for that course
  // You might add more details here if your backend sends them, e.g.,
  // total_classes_completed: number;
  // total_classes_in_course: number;
}

export interface PaginatedCourseResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = 'http://localhost:5000/api/v1/courses';






  constructor(private http:HttpClient) { }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createCourse(courseData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, courseData, {
      headers: this.getAuthHeaders(),
    });
  }

  getCourses(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  category: string = ''
): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('search', search)
    .set('category', category);

  return this.http.get(`${this.apiUrl}/all`, {
    headers: this.getAuthHeaders(),
    params
  });
}

 getCoursesByTeacher(
  page: number = 1,
  limit: number = 10,
  search: string = '',
  category: string = ''
): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('search', search)
    .set('category', category);

  return this.http.get(`${this.apiUrl}/all`, {
    headers: this.getAuthHeaders(),
    params
  });
}

  updateCourse(id: number, courseData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, courseData, {
      headers: this.getAuthHeaders(),
    });
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`http://localhost:5000/api/v1/courses/details/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`http://localhost:5000/api/v1/courses/delete/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllCoursesForDropdown(): Observable<any> {
  return this.http.get(`http://localhost:5000/api/v1/courses/teacher/get`, {
    headers: this.getAuthHeaders()
  });


  

}

getStudentsInCourseWithProgress(courseId: string): Observable<StudentProgress[]> {
    return this.http.get<StudentProgress[]>(`http://localhost:5000/api/v1/progress/students/${courseId}/students-progress`, {
      headers: this.getAuthHeaders()
    });
  }


getCoursesWithClasses(): Observable<any> {
  return this.http.get(`http://localhost:5000/api/v1/classes/with-classes`, {
    headers: this.getAuthHeaders()
  });
}

getSingleCourseWithClasses(courseId: number): Observable<any> {
  return this.http.get(`http://localhost:5000/api/v1/classes/${courseId}/with-classes`, {
    headers: this.getAuthHeaders(),
  });
}



  

}
