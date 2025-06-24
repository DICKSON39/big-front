import { Component, OnInit } from '@angular/core';
import { AiSuggestionService } from '../../services/ai-suggestion.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { AiSuggestionResponse, Course } from '../models/ai-suggestion.model';

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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe((user) => {
      if (user) {
        this.userFullName = `${user.first_name} ${user.last_name}`;
        this.messages.push({
          from: 'ai',
          text: `👋 Hello ${this.userFullName}! I'm your LMS Career Advisor AI.
I can help you find learning paths, recommend courses, and answer questions about what's offered.
Try asking something like:
• "I want to learn mobile development"
• "What courses do you have?"
• "Suggest a career path for web design"`
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

    this.authService.getUserId().subscribe(userId => {
      this.aiService.saveChatHistory({
        user_id: userId ?? '',
        from: 'user',
        message: currentMessage
      }).subscribe();
    });

    const greetingRegex = /\b(hi|hello|hey|yo|sup|greetings|what can you do)\b/i;
    if (greetingRegex.test(currentMessage)) {
      const aiMsg: Message = {
        from: 'ai',
        text: `👋 Hello ${this.userFullName} What Can I do for you?`
      };
      this.messages.push(aiMsg);
      this.isLoading = false;

      this.authService.getUserId().subscribe(userId => {
        this.aiService.saveChatHistory({
          user_id: userId ?? '',
          from: 'ai',
          message: aiMsg.text!
        }).subscribe();
      });

      return;
    }

    const courseListRegex = /(what|which)?\s*(courses|classes).*available|do you have|offer/i;
    if (courseListRegex.test(currentMessage)) {
      this.authService.getUserId().pipe(
        switchMap(userId => this.aiService.getAllCourses(userId ?? ''))
      ).subscribe({
        next: (res) => {
          const msg: Message = {
            from: 'ai',
            text: '📚 Here are all the available courses:',
            courses: res.courses || []
          };
          this.messages.push(msg);
          this.isLoading = false;

          this.authService.getUserId().subscribe(userId => {
            this.aiService.saveChatHistory({
              user_id: userId ?? '',
              from: 'ai',
              message: msg.text!,
              courses: msg.courses
            }).subscribe();
          });
        },
        error: () => {
          this.messages.push({ from: 'ai', text: '⚠️ Failed to fetch courses.' });
          this.isLoading = false;
        }
      });
      return;
    }

    const isFollowUp = /(also|now|add|too|as well)/i.test(currentMessage);
    if (isFollowUp && this.lastInterest) {
      this.lastInterest += `, ${currentMessage}`;
    } else {
      this.lastInterest = currentMessage;
    }

    // Remove these flags, as they are now handled by the message object
    // this.awaitingQuiz = false;
    // this.quizQuestions = [];
    // this.quizAnswers = {};

    this.authService.getUserId().pipe(
      switchMap(userId =>
        this.aiService.suggestCareerPath({
          user_id: userId ?? '',
          interests: [this.lastInterest],
          answers: {} // Initial call, no answers yet
        })
      )
    ).subscribe({
      next: (res: AiSuggestionResponse) => {
        if (res.ask_quiz) {
          // If a quiz is needed, add a specific quiz message
          this.messages.push({
            from: 'ai',
            type: 'quiz',
            quizQuestions: res.questions || [],
            quizAnswers: {}, // Initialize empty answers for this new quiz message
            quizSubmitted: false // Mark as not yet submitted
          });
          // No need to set awaitingQuiz or quizQuestions/Answers directly on component anymore
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
}