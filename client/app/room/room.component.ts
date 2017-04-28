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
        private alertService: AlertService) { 
             this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
             this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
    }

    ngOnInit(){
        if(this.currentUser.teacher){
            this.getReq();
        }
    }

    getReq(){
        this.classroomService.getReq(this.currentRoom._id).subscribe(
            user => { this.pendingReq = user; 
                console.log(user);
            }
        );
    }
    
}
