import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User, Classroom } from '../_models/index';
import { AlertService, ClassroomService, UserService, RoomAuthService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    currentUser: User;
    classrooms: Classroom[] = [];
    model: any = {};
    loading = false;
    roomS: string[];

    constructor( 
        private router: Router,
        private classroomService: ClassroomService,
        private userService: UserService,
        private alertService: AlertService,
        private roomAuthService: RoomAuthService) 
        {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.roomS = new Array();
        }

    ngOnInit() {
        this.loadUsersClassrooms();
        this.roomAuthService.exitRoom();
        console.log(this.classrooms);
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

    exitClassroom(room:Classroom){
        for(var i = 0; i < this.classrooms.length; i++) {
            if(this.classrooms[i]._id == room._id) {
                this.classrooms.splice(i, 1);
                break;
            }
        }
        this.userService.exitClassroom(this.currentUser._id, room).subscribe(() => {this.loadUsersClassrooms() });
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

    loadUsersClassrooms(){
        if(this.currentUser.teacher){
            this.classroomService.getByTeacherId(this.currentUser._id).subscribe(classrooms => { this.classrooms = classrooms;});
        }
        else{
            this.userService.getClassrooms(this.currentUser._id).subscribe(rooms => { rooms.forEach(room =>{
                this.getRoom(room);
            })});
        }
    }

    getRoom(cRoom: string){
        console.log(cRoom);
        this.classroomService.getById(cRoom).subscribe(
            realRoom => { 
                var j = false;
                for(var i = 0; i < this.classrooms.length; i++) {
                    if(this.classrooms[i]._id == realRoom._id) {
                        j = true;
                        break;
                    }
                }
                if(j == false){
                    this.classrooms.push(realRoom); 
                }
        });
    }
   
}