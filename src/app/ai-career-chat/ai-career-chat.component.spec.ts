import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiCareerChatComponent } from './ai-career-chat.component';

describe('AiCareerChatComponent', () => {
  let component: AiCareerChatComponent;
  let fixture: ComponentFixture<AiCareerChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiCareerChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiCareerChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
