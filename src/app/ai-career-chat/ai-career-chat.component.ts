import { Component ,OnInit} from '@angular/core';
import { AiSuggestionService } from '../../services/ai-suggestion.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { AiSuggestionResponse,Course} from '../models/ai-suggestion.model';

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

  // 🧪 Quiz state
  awaitingQuiz = false;
  quizQuestions: string[] = [];
  quizAnswers: Record<string, string> = {};
  lastInterest = '';

  constructor(
    private aiService: AiSuggestionService,
    private authService: AuthService
  ) {}


  // fallback default

ngOnInit(): void {
  this.authService.getUser().subscribe((user) => {
    if (user) {
      this.userFullName = `${user.first_name} ${user.last_name}`;
      // Push greeting message to chat automatically
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
}


  sendMessage() {
    if (!this.userMessage.trim()) return;

    const currentMessage = this.userMessage.trim().toLowerCase();
    this.messages.push({ from: 'user', text: currentMessage });
    this.userMessage = '';
    this.isLoading = true;

    // 👋 Greetings
    const greetingRegex = /\b(hi|hello|hey|yo|sup|greetings|what can you do)\b/i;
    if (greetingRegex.test(currentMessage)) {
      this.messages.push({
        from: 'ai',
        text: `👋 Hello ${this.userFullName} What Can I do for you?`
      });
      this.isLoading = false;
      return;
    }

    // 📚 Course list detection
    const courseListRegex = /(what|which)?\s*(courses|classes).*available|do you have|offer/i;
    if (courseListRegex.test(currentMessage)) {
      this.authService.getUserId().pipe(
        switchMap(userId =>
          this.aiService.getAllCourses(userId ?? '')
        )
      ).subscribe({
        next: (res) => {
          this.messages.push({
            from: 'ai',
            text: '📚 Here are all the available courses:',
            courses: res.courses || []
          });
          this.isLoading = false;
        },
        error: () => {
          this.messages.push({ from: 'ai', text: '⚠️ Failed to fetch courses.' });
          this.isLoading = false;
        }
      });
      return;
    }

    // 🧠 Regular AI logic
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
  if (res.fallback && (res.suggested_courses?.length ?? 0) > 0) {
    this.messages.push({
      from: 'ai',
      text: res.message ?? 'Here are some suggested alternative courses.',
      courses: res.suggested_courses
    });
  } else {
    this.messages.push({
      from: 'ai',
      path_name: res.path?.path_name,
      steps: res.path?.steps || [],
      courses: res.matching_courses || []
    });
  }

  this.isLoading = false;
}




  allQuizAnswered(): boolean {
    return this.quizQuestions.every(q => this.quizAnswers[q]?.trim());
  }
}
