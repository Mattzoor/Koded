import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User, Classroom } from '../_models/index';
import { AlertService, ClassroomService, RoomAuthService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    currentUser: User;
    classrooms: Classroom[] = [];
    model: any = {};
    loading = false;

    constructor( 
        private router: Router,
        private classroomService: ClassroomService,
        private alertService: AlertService,
        private roomAuthService: RoomAuthService) 
        {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        }

    ngOnInit() {
        this.loadUsersClassrooms();
        this.roomAuthService.exitRoom();
    }
    
    createClassroom(){
        this.loading = true;
        this.model.teacherId = this.currentUser._id;
        this.classroomService.create(this.model)
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.loadUsersClassrooms();
                },
                error => {
                    this.alertService.error(error._body);
                });
      this.loading = false;
    }
    
    enterRoom(_id:string){
        this.loading = true;
        this.roomAuthService.enterRoom(_id)
            .subscribe(
                data => {
                    this.router.navigate(['/classroom']);
                },
                error => {
                    this.alertService.error(error._body);
                    this.loading = false;
                });
    }

    sendReqToClassroom(){
        this.loading = true;
        this.classroomService.sendReq(this.model.roomName,this.currentUser).subscribe(() => { this.loadUsersClassrooms() });
        this.loading = false;
    }

    deleteClassroom(_id: string) {
        this.classroomService.delete(_id).subscribe(() => { this.loadUsersClassrooms() });
    }

    private loadAllClassrooms() {
        this.classroomService.getAll().subscribe(classrooms => { this.classrooms = classrooms; })
    }

    private loadUsersClassrooms(){
        if(this.currentUser.teacher){
            this.classroomService.getByTeacherId(this.currentUser._id).subscribe(classrooms => { this.classrooms = classrooms;});
        }
        else{
            this.classroomService.getByStudentId(this.currentUser._id).subscribe(classrooms => { this.classrooms = classrooms;});
        }
    }
   
}