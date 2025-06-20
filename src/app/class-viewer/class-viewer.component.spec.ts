import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassViewerComponent } from './class-viewer.component';

describe('ClassViewerComponent', () => {
  let component: ClassViewerComponent;
  let fixture: ComponentFixture<ClassViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
