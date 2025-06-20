import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyResetOtpComponent } from './verify-reset-otp.component';

describe('VerifyResetOtpComponent', () => {
  let component: VerifyResetOtpComponent;
  let fixture: ComponentFixture<VerifyResetOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyResetOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyResetOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
