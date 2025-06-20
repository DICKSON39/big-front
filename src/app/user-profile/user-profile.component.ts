import { CommonModule,Location } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  user: any = {};
  loading: boolean = false;


  ngOnInit(): void {
    const userId = +this.route.snapshot.paramMap.get('id')!;
    this.getUserById(userId);
  }

  constructor(private userService:UserService,private route:ActivatedRoute,private location:Location) {}



  getUserById(userId:number){
    this.userService.getUserById(userId).subscribe((data)=> {
      this.user = data;
    })
  }

  getRoleName(role_id:number):string{
    switch (role_id) {
      case 1:
        return 'Admin';
      case 2:
        return 'Teacher';
      case 3:
        return 'User';
      default:
        return 'Unknown';
    }
  }

  goBack():void{
    this.location.back();
    
  }
  

}
