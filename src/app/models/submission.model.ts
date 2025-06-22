// src/app/models/submission.model.ts

export interface Submission {
  id: number;
  user_id: number;
  assignment_id: number;
  submission_url: string;
  grade: string | null;
  feedback: string | null;
  user_name: string

  // For input binding
  gradeInput?: string;
  feedbackInput?: string | null;
}
