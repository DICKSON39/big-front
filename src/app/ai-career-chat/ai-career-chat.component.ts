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

  // Quiz state
  awaitingQuiz = false;
  quizQuestions: string[] = [];
  quizAnswers: Record<string, string> = {};
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

    this.awaitingQuiz = false;
    this.quizQuestions = [];
    this.quizAnswers = {};

    this.authService.getUserId().pipe(
      switchMap(userId =>
        this.aiService.suggestCareerPath({
          user_id: userId ?? '',
          interests: [this.lastInterest],
          answers: {}
        })
      )
    ).subscribe({
      next: (res: AiSuggestionResponse) => {
        if (res.ask_quiz) {
          this.awaitingQuiz = true;
          this.quizQuestions = res.questions || [];
          this.quizAnswers = {};
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

  submitQuizAnswers() {
    this.isLoading = true;
    this.authService.getUserId().pipe(
      switchMap(userId =>
        this.aiService.suggestCareerPath({
          user_id: userId ?? '',
          interests: [this.lastInterest],
          answers: this.quizAnswers
        })
      )
    ).subscribe({
      next: (res: AiSuggestionResponse) => {
        this.awaitingQuiz = false;
        this.quizQuestions = [];
        this.addAiPathResponse(res);
      },
      error: () => {
        this.messages.push({ from: 'ai', text: '⚠️ Something went wrong.' });
        this.isLoading = false;
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

  allQuizAnswered(): boolean {
    return this.quizQuestions.every(q => this.quizAnswers[q]?.trim());
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
          from: msg.from_role, // ✅ this is the fix for showing user + ai messages
          text: msg.text ?? msg.message,
          path_name: msg.path_name,
          steps: msg.steps,
          courses: msg.courses
        }));

        this.messages = [...mappedMessages, ...this.messages]; // prepend older msgs
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
