import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCoursesClassesComponent } from './admin-courses-classes.component';

describe('AdminCoursesClassesComponent', () => {
  let component: AdminCoursesClassesComponent;
  let fixture: ComponentFixture<AdminCoursesClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoursesClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCoursesClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
