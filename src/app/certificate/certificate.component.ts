import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component ,EventEmitter,Input,OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CertificateService } from '../../services/certificate.service';
import { CourseService } from '../../services/course.service';


@Component({
  selector: 'app-certificate',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.css'
})
export class CertificateComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>(); 
  certificateForm!: FormGroup;
  courses: any[] = [];
  selectedFile: File | null = null;
  @Input() preselectedCourseId: number | null = null;


  constructor(
    private fb:FormBuilder,
    private http:HttpClient,
    private snackBar: MatSnackBar,
    private certificateService:CertificateService,
    private courseService:CourseService
  
  ) {}

  ngOnInit(): void {
      this.certificateForm = this.fb.group({
  certificate_url: [null],
  course_id: [this.preselectedCourseId || null, Validators.required], // ✅ add this
});


      this.fetchCourses();

      
  }

  fetchCourses():void{
    this.courseService.getAllCoursesForDropdown().subscribe({
      next:(res:any) => {
        this.courses = res.data || res;

        if(this.preselectedCourseId) {
          this.certificateForm.patchValue({course_id:this.preselectedCourseId})
        }
      },
      error: () => {
        this.snackBar.open('Failed To load Course','Close',{duration:3000})
      },
    })

  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(e:Event):void{
    e.preventDefault();

    if (this.certificateForm.invalid || !this.selectedFile) {
      this.snackBar.open('Please fill out the form correctly.', 'Close', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('certificate_url',this.certificateForm.get('certificate_url')?.value)
    formData.append('course_id',this.certificateForm.get('course_id')?.value);
    formData.append('file', this.selectedFile);

    this.certificateService.uploadCertificate(formData).subscribe({
      next: (res)=> {
        this.snackBar.open(res.message || 'Certificate Uploaded SuccessFully', 'Close',{
          duration: 3000,
        });
        this.closeModal.emit();
      },

      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to create certificate', 'Close', {
          duration: 3000,
        })
      }
    })
  }

  onClose():void{
    this.closeModal.emit();
  }

  

}
