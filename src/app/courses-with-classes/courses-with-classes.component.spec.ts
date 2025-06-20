import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesWithClassesComponent } from './courses-with-classes.component';

describe('CoursesWithClassesComponent', () => {
  let component: CoursesWithClassesComponent;
  let fixture: ComponentFixture<CoursesWithClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesWithClassesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesWithClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
