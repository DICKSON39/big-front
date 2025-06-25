import { Component, OnInit } from '@angular/core';
import { AiSuggestionService } from '../../services/ai-suggestion.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { AiSuggestionResponse, Course } from '../models/ai-suggestion.model';
import { Observable, of } from 'rxjs';
import { AdminStatsService } from '../../services/admin-stats.service';
import { CourseService } from '../../services/course.service';


interface Message {
  from: 'user' | 'ai';
  text?: string;
  path_name?: string;
  steps?: string[];
  courses?: Course[];
  // New properties for quiz messages
  type?: 'text' | 'path' | 'quiz'; // Added 'quiz' type
  quizQuestions?: string[]; // Questions for the quiz
  quizAnswers?: Record<string, string>; // Answers for the quiz
  quizSubmitted?: boolean; // To disable/hide the quiz form after submission
}

@Component({
  selector: 'app-ai-career-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-career-chat.component.html',
  styleUrls: ['./ai-career-chat.component.css']
})
export class AiCareerChatComponent implements OnInit {
  messages: Message[] = [];
  userMessage = '';
  isLoading = false;
  userFullName = 'Learner';

  userRole: number | null = null;
  // Lazy loading
  limit = 10;
  offset = 0;
  totalMessages = 0;
  isLoadingMore = false;

  // Quiz state - these can mostly be removed or refactored
  // awaitingQuiz = false; // This flag will no longer directly control the quiz form display
  // quizQuestions: string[] = []; // These will be part of the quiz message object
  // quizAnswers: Record<string, string> = {}; // These will be part of the quiz message object
  lastInterest = '';

  constructor(
    private aiService: AiSuggestionService,
    private authService: AuthService,
    private adminStatsService: AdminStatsService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user) => {
      if (user) {
        this.userFullName = `${user.first_name} ${user.last_name}`;
        this.userRole = user.role_id;
        this.messages.push({
          from: 'ai',
          text: `💥 *BURP* Hey, kid. I’m “Dickson AI” — LMS-powered, interdimensional intelligence with a TypeScript hangover and questionable design choices.

I’m here to *simulate* being helpful, guide you through career wormholes, and maybe — just maybe — stop you from becoming a tech NPC.

Try saying stuff like:
• “What path should I follow, Rick—I mean, Dickson AI?”  
• “Got any courses that won’t destroy my soul?”  
• “How do I become less... useless?”

🚀 Built with 3 lines of working code and 900 console.logs.  
Made in Universe C-137. Updated nightly in my garage.

Now come on Morty, let’s pick a career path before I self-destruct again. We don’t have time for a resume crisis AND another evil AI uprising. Let’s gooo!`

        });
      }
    });
    this.loadOlderMessages();
  }
sendMessage() {
  if (!this.userMessage.trim()) return;

  const currentMessage = this.userMessage.trim().toLowerCase();
  const userMsg: Message = { from: 'user', text: currentMessage };
  this.messages.push(userMsg);
  this.userMessage = '';
  this.isLoading = true;

  this.authService.getUser().pipe(
    switchMap(user => {
      const userId = user?.id ?? '';
      const roleId = user?.role_id ?? 3;
      this.userFullName = `${user?.first_name} ${user?.last_name}`;

      this.aiService.saveChatHistory({
        user_id: userId,
        from: 'user',
        message: currentMessage
      }).subscribe();

      // 🔁 Custom greeting logic
      const greetingRegex = /\b(hi|hello|hey|yo|sup|greetings|what can you do)\b/i;
      if (greetingRegex.test(currentMessage)) {
        let roleGreeting = `👋 Hello ${this.userFullName}, what can I do for you today?`;

        if (roleId === 1) {
          roleGreeting = `🧠 Welcome back Admin ${this.userFullName}. Ready to strategize some career moves for your learners?`;
        } else if (roleId === 2) {
          roleGreeting = `📚 Hey Teacher ${this.userFullName}, designing curriculum today or just vibing with Dickson AI?`;
        }

        const aiMsg: Message = {
          from: 'ai',
          text: roleGreeting
        };

        this.messages.push(aiMsg);
        this.isLoading = false;

        this.aiService.saveChatHistory({
          user_id: userId,
          from: 'ai',
          message: aiMsg.text!
        }).subscribe();

        return of(null); // Stop the flow, don’t go to suggestCareerPath
      }

      const statsRegex = /\b(my stats|dashboard|admin stats|teacher stats|show my insights?)\b/i;
if (statsRegex.test(currentMessage)) {
  this.getRoleBasedStats(); // 🧠 Let Dickson flex
  return of(null); // Stop further flow
}


const teacherCourseRegex = /\b(my courses|my classes|what (did|have) i create(d)?|show my courses|my lessons|i created)\b/i;
if (teacherCourseRegex.test(currentMessage) && roleId === 2) {
  return this.courseService.getAllCoursesForDropdown().pipe(
    switchMap((res: any) => {
      const teacherMsg: Message = {
        from: 'ai',
        text: '🧑‍🏫 Here are the courses you’ve created:',
        courses: res || []
      };
      this.messages.push(teacherMsg);

      this.aiService.saveChatHistory({
        user_id: userId,
        from: 'ai',
        message: teacherMsg.text ?? 'Teacher Course List',
        courses: teacherMsg.courses
      }).subscribe();

      this.isLoading = false;
      return of(null); // Stop further flow
    })
  );
}



      

      const courseListRegex = /(what|which)?\s*(courses|classes).*available|do you have|offer/i;
      if (courseListRegex.test(currentMessage)) {
        return this.aiService.getAllCourses(userId);
      }

      const isFollowUp = /(also|now|add|too|as well)/i.test(currentMessage);
      if (isFollowUp && this.lastInterest) {
        this.lastInterest += `, ${currentMessage}`;
      } else {
        this.lastInterest = currentMessage;
      }

      return this.aiService.suggestCareerPath({
        user_id: userId,
        interests: [this.lastInterest],
        answers: {}
      });
    })
  ).subscribe({
    next: (res: AiSuggestionResponse | any) => {
      if (!res) return;

      // 📚 Show available courses
      if (Array.isArray(res?.courses)) {
        const msg: Message = {
          from: 'ai',
          text: '📚 Here are all the available courses:',
          courses: res.courses || []
        };
        this.messages.push(msg);
        this.isLoading = false;
        return;
      }

      // 🧠 Suggest career path or show quiz
      if (res.ask_quiz) {
        this.messages.push({
          from: 'ai',
          type: 'quiz',
          quizQuestions: res.questions || [],
          quizAnswers: {},
          quizSubmitted: false
        });
      } else {
        this.addAiPathResponse(res);
      }

      this.isLoading = false;
    },
    error: () => {
      this.messages.push({ from: 'ai', text: '⚠️ Something went wrong.' });
      this.isLoading = false;
    }
  });
}


  // Modified to take the specific quiz message as an argument
  submitQuizAnswers(quizMessage: Message) {
    if (!quizMessage.quizAnswers || !this.allQuizAnswered(quizMessage.quizQuestions!, quizMessage.quizAnswers)) {
      // You might want to show an in-chat message instead of an alert
      alert('Please answer all quiz questions before submitting.');
      return;
    }

    this.isLoading = true;

    // Mark the current quiz message as submitted to disable its form
    quizMessage.quizSubmitted = true;

    this.authService.getUserId().pipe(
      switchMap(userId =>
        this.aiService.suggestCareerPath({
          user_id: userId ?? '',
          interests: [this.lastInterest],
          answers: quizMessage.quizAnswers! // Use answers from the specific quiz message
        })
      )
    ).subscribe({
      next: (res: AiSuggestionResponse) => {
        // You might want to replace the quiz message with a text summary of answers
        const quizSummaryText = `Skill check completed! You answered:\n${
          Object.entries(quizMessage.quizAnswers!)
            .map(([q, a]) => `- ${q}: ${a === 'yes' ? 'Yes' : 'No'}`)
            .join('\n')
        }\n\nBased on this, I'll provide tailored recommendations.`;

        // Find the index of the submitted quiz message and update its text
        const quizIndex = this.messages.indexOf(quizMessage);
        if (quizIndex !== -1) {
          this.messages[quizIndex] = {
            ...quizMessage, // Keep existing properties
            type: 'text', // Change type to text
            text: quizSummaryText, // Add the summary text
            quizQuestions: undefined, // Clear quiz specific data
            quizAnswers: undefined,
            quizSubmitted: undefined
          };
        }

        this.addAiPathResponse(res);
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ from: 'ai', text: '⚠️ Something went wrong.' });
        this.isLoading = false;
        // Revert quizSubmitted if there's an error, or handle as appropriate
        quizMessage.quizSubmitted = false;
      }
    });
  }

  addAiPathResponse(res: AiSuggestionResponse) {
    const msg: Message = res.fallback && (res.suggested_courses?.length ?? 0) > 0
      ? {
          from: 'ai',
          text: res.message ?? 'Here are some suggested alternative courses.',
          courses: res.suggested_courses
        }
      : {
          from: 'ai',
          path_name: res.path?.path_name,
          steps: res.path?.steps || [],
          courses: res.matching_courses || []
        };

    this.messages.push(msg);

    this.authService.getUserId().subscribe(userId => {
      this.aiService.saveChatHistory({
        user_id: userId ?? '',
        from: 'ai',
        message: msg.text ?? '📈 Career Path',
        path_name: msg.path_name,
        steps: msg.steps,
        courses: msg.courses
      }).subscribe();
    });

    this.isLoading = false;
  }

  // Modified to take questions and answers of the specific quiz message
  allQuizAnswered(questions: string[], answers: Record<string, string>): boolean {
    if (!questions || !answers) return false;
    return questions.every(q => answers[q]?.trim());
  }

  loadOlderMessages() {
    this.isLoadingMore = true;

    this.authService.getUserId().pipe(
      switchMap(userId =>
        this.aiService.getChatHistory(userId ?? '', this.limit, this.offset)
      )
    ).subscribe({
      next: (res) => {
        const mappedMessages: Message[] = (res.messages || []).map((msg: any) => ({
          from: msg.from_role,
          text: msg.text ?? msg.message,
          path_name: msg.path_name,
          steps: msg.steps,
          courses: msg.courses,
          // When loading history, quizzes would typically be loaded as text
          // If you want to persist the quiz state across sessions, you'd need more complex logic
          type: msg.type || (msg.path_name ? 'path' : 'text'), // Default type if not explicitly saved
          quizQuestions: msg.quizQuestions, // Only if you save quiz questions in history
          quizAnswers: msg.quizAnswers, // Only if you save quiz answers in history
          quizSubmitted: msg.quizSubmitted // Only if you save quiz submitted state in history
        }));

        this.messages = [...mappedMessages, ...this.messages];
        this.totalMessages = res.totalCount;
        this.offset += this.limit;
        this.isLoadingMore = false;
      },
      error: () => {
        this.isLoadingMore = false;
        console.error('❌ Failed to load chat history');
      }
    });
  }

  getRoleBasedStats(): void {
  this.isLoading = true;

  let statsCall$: Observable<any>;
  let roleText = '';
  let formatter: (data: any) => string;

  if (this.userRole === 1) {
    statsCall$ = this.adminStatsService.getStats();
    roleText = '📊 Admin insights locked and loaded.';
    formatter = this.formatAdminStats;
  } else if (this.userRole === 2) {
    statsCall$ = this.adminStatsService.getTeacherStats();
    roleText = '📘 Teacher stats ready, prof.';
    formatter = this.formatTeacherStats;
  } else if (this.userRole === 3) {
    statsCall$ = this.adminStatsService.getMyStats();
    roleText = '🎓 Student dashboard data incoming...';
    formatter = this.formatStudentStats;
  } else {
    this.messages.push({ from: 'ai', text: '🤖 Unknown role. I’m confused, Morty.' });
    this.isLoading = false;
    return;
  }

  statsCall$.subscribe({
    next: (res) => {
      const formatted = formatter(res.data);
      this.messages.push({ from: 'ai', text: `${roleText}\n\n${formatted}` });
      this.isLoading = false;
    },
    error: () => {
      this.messages.push({ from: 'ai', text: '⚠️ Couldn’t fetch your stats. Interdimensional glitch?' });
      this.isLoading = false;
    }
  });
}


formatAdminStats = (data: any) => `
📊 *Admin Dashboard Summary*

👥 Total Users: ${data.total_users}  
🎓 Students: ${data.total_students}  
🧑‍🏫 Teachers: ${data.total_teachers}  
📘 Courses Created: ${data.total_courses}  
📝 Enrollments: ${data.total_enrollments}  
📤 Submissions: ${data.total_submissions}  
✅ Completed Classes: ${data.total_completed_classes}  
💰 Revenue: $${(+data.total_revenue).toFixed(2)}

📦 *Revenue Breakdown*
${
  Object.keys(data.revenue_by_method || {}).length
    ? Object.entries(data.revenue_by_method).map(([method, total]: [string, any]) =>
        `• ${method}: $${(+total).toFixed(2)}`
      ).join('\n')
    : 'No revenue yet... 🫠'
}

📚 *Top-Earning Courses*
${
  (data.revenue_by_course || []).length
    ? data.revenue_by_course.map((c: any) =>
        `• ${c.course_title}: $${(+c.total_earned).toFixed(2)}`
      ).join('\n')
    : 'None yet! 😤'
}
`.trim();

formatTeacherStats = (data: any) => `
📘 *Teacher Dashboard Insights*

📚 Total Courses Created: ${data.total_courses}  
👨‍🎓 Enrolled Students: ${data.total_enrolled_students}  
📝 Assignments Given: ${data.total_assignments_given}  
🎓 Certificates Uploaded: ${data.total_certificates_uploaded}
`.trim();

formatStudentStats = (data: any) => `
🎓 *Student Progress Report*

📘 Courses Enrolled: ${data.total_courses}  
📝 Assignments Received: ${data.total_assignments}  
📺 Classes Accessed: ${data.total_classes}  
📈 Average Progress: ${data.average_progress}%  
🏆 Certificates Earned: ${data.total_certificates}
`.trim();




}