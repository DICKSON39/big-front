import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCertListComponent } from './admin-cert-list.component';

describe('AdminCertListComponent', () => {
  let component: AdminCertListComponent;
  let fixture: ComponentFixture<AdminCertListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCertListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCertListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
