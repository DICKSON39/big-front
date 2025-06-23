import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

interface Submission {
  id: number;
  assignment_id: number;
  user_id: number;
  submission_url: string;
  grade: string;
  feedback: string;
  gradeInput?: string;
  feedbackInput?: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_id: number;
  created_at: string;
  user_id: string;

  // 👇 Add this
  submissions?: Submission[];
}


interface AssignmentResponse {
  message: string;
  assignment: Assignment;
}

interface SubmissionResponse {
  message: string;
  submission: {
    id: number;
    assignment_id: number;
    user_id: number;
    submission_url: string;
    grade: string;
    feedback: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private apiUrl = 'https://school-online-backend.onrender.com/api/v1/assignment';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // ✅ Create assignment
  createAssignment(courseId: string, data: any): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(
      `${this.apiUrl}/assignments/${courseId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Submit assignment (now pulls user_id from AuthService)
  submitAssignment(data: {
  assignment_id: number;
  user_id: number;
  submission_url?: string;
}): Observable<SubmissionResponse> {
  return this.http.post<SubmissionResponse>(
    `https://school-online-backend.onrender.com/api/submissions/submit`,
    data,
    { headers: this.getAuthHeaders() }
  );
}


  // ✅ Get assignments + status
  getAssignmentsWithStatus(courseId: number, userId: number): Observable<any> {
  return this.http.get<any>(
    `https://school-online-backend.onrender.com/api/v1/assignment/assignments/status/${courseId}/${userId}`,
    { headers: this.getAuthHeaders() }
  );
}


  // ✅ Teacher only
  getAssignmentsByCourse(courseId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/assignments/course/${courseId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ View submissions for assignment
  getSubmissionsByAssignment(assignmentId: number): Observable<any> {
    return this.http.get<any>(
      `https://school-online-backend.onrender.com/api/submissions/${assignmentId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ View all submissions in a course
getSubmissionsByCourse(courseId: number): Observable<any> {
  return this.http.get<any>(
    `https://school-online-backend.onrender.com/api/submissions/course/${courseId}`,
    { headers: this.getAuthHeaders() }
  );
}


  // ✅ Grade it
  gradeSubmission(submissionId: number, data: { grade: string; feedback: string }): Observable<any> {
    return this.http.patch<any>(
      `https://school-online-backend.onrender.com/api/submissions/${submissionId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  resubmitAssignment(data: {
  assignment_id: number;
  user_id: number;
  submission_url: string;
}): Observable<any> {
  return this.http.put(`https://school-online-backend.onrender.com/api/submissions/resubmit`, data,{
    headers: this.getAuthHeaders()
  }); // Adjust your route accordingly
}


deleteSubmission(userId: number, assignmentId: number): Observable<any> {
  return this.http.delete(`https://school-online-backend.onrender.com/api/submissions/${userId}/${assignmentId}`,{
    headers: this.getAuthHeaders()
  });
}

}
