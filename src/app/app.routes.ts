import { Routes } from '@angular/router';
import {LandingComponent} from './landing/landing.component';
import {RegisterComponent} from './register/register.component';
import {OtpVerificationComponent} from './otp-verification/otp-verification.component';
import {LoginComponent} from './login/login.component';
import {AdminComponent} from './admin/admin.component';
import {TeacherComponent} from './teacher/teacher.component';
import {UserComponent} from './user/user.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {VerifyResetOtpComponent} from './verify-reset-otp/verify-reset-otp.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {AuthGuard} from './auth.guard';
import {AddUserComponent} from './admin/add-user/add-user.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TeacherStudentsComponent } from './teacher/teacher-students/teacher-students.component';
import { TeachersCoursesComponent } from './teacher/teachers-courses/teachers-courses.component';


import { CourseInfoComponent } from './course-info/course-info.component';
import { CoursesWithClassesComponent } from './courses-with-classes/courses-with-classes.component';
import { ClassViewerComponent } from './class-viewer/class-viewer.component';

import { AdminCourseClassesComponent } from './admin-courses-classes/admin-courses-classes.component';
import { EnrolledStudentsComponent } from './admin/enrolled-students/enrolled-students.component';
import { StudentCourseProgressComponent } from './student-course-progress/student-course-progress.component';
import { NotificationComponent } from './notification/notification.component';
import { CertificateComponent } from './certificate/certificate.component';
import { AllCertificatesComponent } from './all-certificates/all-certificates.component';
import { AdminCertListComponent } from './admin-cert-list/admin-cert-list.component';

export const routes: Routes = [
  {
    path: '',
    component:LandingComponent,

  },
  {
    path: 'register',
    component:RegisterComponent
  },
  {
    path: 'otp-verification',
    component:OtpVerificationComponent
  },

  {
    path: 'login',
    component:LoginComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    }
  },
  {
    path: 'teacher',
    component: TeacherComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[2]
    }
  },
  {
    path: 'student',
    component:UserComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[3]
    }
  },
  {
    path:'forgot-password',
    component:ForgotPasswordComponent
  },
  {
    path:'verify-reset-otp',
    component:VerifyResetOtpComponent
  },

  {
    path:'reset-password',
    component:ResetPasswordComponent
  },
  {
    path:'admin/add-user',
    component:AddUserComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    },
   

  },

  {
    path: 'admin/courses',
    loadComponent: () => import('./admin/admin-courses/admin-courses.component').then(m => m.AdminCoursesComponent),
    canActivate: [AuthGuard],
    data: {
      roles:[1,2]
    }
  },
   {
      path: 'admin/users',
      component:AdminUsersComponent,
      canActivate: [AuthGuard],
      data: {
        roles:[1]
      }
    },

    {
      path: 'profile',
      component:ProfilePageComponent,
      canActivate: [AuthGuard],
      data: {
        roles:[1, 2, 3] 
      }
    },

    {
    path:'users/update/:id',
    component:EditUserComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    }
  },

  {
    path: 'users/:id',
    component:UserProfileComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    },
    

  },
  {
      path:'students',
      component:TeacherStudentsComponent,
      canActivate: [AuthGuard],
    data: {
      roles:[2]
    }
    },

    {
      path: 'courses',
      loadComponent: () => import('./courses/courses.component').then(m => m.CoursesComponent),
    },

    {
      path: 'courses/:id',
      component: CourseInfoComponent,
      canActivate: [AuthGuard],
      data: {
        roles: [1,2,3]
      }
    },
  
  {
    path: 'teacher/courses',
    component: TeachersCoursesComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[2]
    }
  },
  {
    path: 'teacher/courses-with-classes',
    component:CoursesWithClassesComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[2,1]
    }
  },

  {
    path: 'teacher/courses/:courseId/classes',
    component:ClassViewerComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[2,1]
    }
  },
  {
    path:'admin/courses/:courseId/classes',
    component: AdminCourseClassesComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    }
  },
  {
    path: 'enrollments',
    loadComponent: () => import('./admin/enrolled-students/enrolled-students.component').then(m => m.EnrolledStudentsComponent),
    canActivate: [AuthGuard],
    data: {
      roles:[1]
    }
  },
  {
    path: 'classes/students',
    component:StudentCourseProgressComponent
  },
  {
    path: 'notifications',
    component:NotificationComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1, 2, 3]
    }
  },
  {
    path:'certificate/upload',
    component:CertificateComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1, 2, ]
    }

  },
  {
    path:'certificate',
    component:AllCertificatesComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[3]
    }
  },
  {
    path: 'certificate/admin',
    component: AdminCertListComponent,
    canActivate: [AuthGuard],
    data: {
      roles:[1,2]
    }
  }

  


];
