// src/app/models/assignment.model.ts

import { Submission } from './submission.model';

export interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  course_id: number;
  created_at: string;
  user_id: string;

  // Optional: dynamically added when fetching
  submissions?: Submission[];
}
