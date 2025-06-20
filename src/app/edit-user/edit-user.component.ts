import { Component,OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonModule,Location} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-edit-user',
  imports: [CommonModule,ReactiveFormsModule,ModalComponent],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent {
userForm!:FormGroup;
  userId!:number;
  user:any ={};
  showModal:boolean = false;

  constructor(private userService:UserService,
    private route:ActivatedRoute,
  private fb:FormBuilder, private router: Router,
  private snackBar: MatSnackBar,private location: Location) { 
    // Initialize the form in the constructor
    this.buildForm();
  }

  ngOnInit():void {
    this.userId =Number(this.route.snapshot.params['id']);
    this.buildForm();
    this.fetchUser();

  }

  buildForm():void {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      roleId: ['', Validators.required],
      password: ['', [Validators.minLength(6)]],
      
    });
  }
  fetchUser(): void {
    this.userService.getUserById(this.userId).subscribe((user => {
      this.user = user;
      // Make sure roleId is a number, not a string
      if (user.role_id) user.role_id = Number(user.role_id);

      this.userForm.patchValue(user);
    }))
  }

  updateUser():void {
    this.showModal = true;
  }

  confirmUpdate():void{
    const updatedUser = {
      ...this.user,
      ...this.userForm.value,
       roleId: Number(this.userForm.value.roleId),




    };




    if(updatedUser.password && updatedUser.password.length < 6){
      this.snackBar.open('Passwords do not match!','Close', {
        duration:3000,
        panelClass: ['snackbar-error']
      } );
      return;
    }

    this.userService.updateUser(updatedUser.id,updatedUser).subscribe(
      (response)=> {
        this.snackBar.open('user successfully updated successfully!','Close',{
          duration:3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/admin/users']);

      },
      ()=> {
        this.snackBar.open('Failed to update user!','Close',{
          duration:3000,
          panelClass: ['snackbar-error']
        })
      },
    );
    this.showModal = false;
  }

  goBack():void{
    this.location.back();
    
  }

}
