import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User, Classroom } from '../_models/index';
import { AlertService, UserService, ClassroomService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'room.component.html'
})

export class RoomComponent implements OnInit {
    model: any = {};
    currentUser: User;
    currentRoom: Classroom;
    loading = false;
    pendingReq: User[];
    students: User[];

    constructor(
        private router: Router,
        private classroomService: ClassroomService,
        private userService:UserService,
        private alertService: AlertService) { 
             this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
             this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
             this.pendingReq = new Array();
    }

    ngOnInit(){
        if(this.currentUser.teacher && this.currentRoom.pendingReq != null){
            this.currentRoom.pendingReq.forEach(user => {
                this.getReq(user);
            });
        }
    }

    getReq(user: any){
        this.userService.getById(user).subscribe(
            user => { this.pendingReq.push(user); 
            }
        );
    }

    acceptPendingReq(student:any){

    }

    removePendingReq(student:any){
    }

    
}
