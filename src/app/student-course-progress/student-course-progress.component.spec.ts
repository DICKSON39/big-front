import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCourseProgressComponent } from './student-course-progress.component';

describe('StudentCourseProgressComponent', () => {
  let component: StudentCourseProgressComponent;
  let fixture: ComponentFixture<StudentCourseProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCourseProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCourseProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
