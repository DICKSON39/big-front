import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionGradingComponent } from './submission-grading.component';

describe('SubmissionGradingComponent', () => {
  let component: SubmissionGradingComponent;
  let fixture: ComponentFixture<SubmissionGradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionGradingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionGradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
