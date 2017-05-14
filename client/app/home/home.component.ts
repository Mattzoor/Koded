import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User, Classroom, Snippet } from '../_models/index';
import { AlertService, ClassroomService, RoomAuthService, SnippetService, UserService } from '../_services/index';


@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    currentUser: User;
    currentSnippet: Snippet;
    classrooms: Classroom[] = [];
    pendingReq: Classroom[] = [];
    model: any = {};
    snippetModel: any = {};
    snippets: Snippet[] = [];
    loading = false;
    create = false;
    edit = false;
    editing = false;

    constructor( 
        private router: Router,
        private classroomService: ClassroomService,
        private userService: UserService,
        private snippetService: SnippetService,
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
        if(this.currentUser.teacher){
            this.roomAuthService.enterRoom(_id).subscribe(
                 data => {
                    this.router.navigate(['/classroom']);
                },
                error => {
                     this.alertService.error(error._body);
                });
        }else
        {   
            this.userService.checkRoom(this.currentUser,_id).subscribe(
                (data)=>{
                    console.log("(data)");
                    this.roomAuthService.enterRoom(_id).subscribe(
                        data => {
                            this.router.navigate(['/classroom']);
                        },
                        error => {
                            this.alertService.error(error._body);
                        });
                    this.loading = false;
                },
                error=>{
                    console.log("error");
                    this.alertService.error("Not memeber of room"); 
                    this.loading = false;
                });
        }
        this.loadUsersClassrooms();
        this.loading = false;
    }

    exitClassroom(room:Classroom){
        for(var i = 0; i < this.classrooms.length; i++) {
            if(this.classrooms[i]._id == room._id) {
                this.classrooms.splice(i, 1);
                break;
            }
        }
        this.userService.exitClassroom(this.currentUser._id, room).subscribe(() => {
            this.classroomService.removeStud(this.currentUser, room).subscribe(() => {
                this.loadUsersClassrooms() 
            }); 
        });
    }

    sendReqToClassroom(){
        this.loading = true;
    
        this.pendingReq.forEach((room:Classroom) => {
            if(room.roomName.toLowerCase()==this.model.roomName.toLowerCase()){
                this.loading = false;
            }
        })
        
        this.classrooms.forEach((room:Classroom) => {
            if(room.roomName.toLowerCase()==this.model.roomName.toLowerCase()){
                this.loading = false;
            }
        })
        if(this.loading == true){
            this.classroomService.sendReq(this.model.roomName,this.currentUser).subscribe(() => { 
            this.classroomService.getByName(this.model.roomName).subscribe((room:Classroom) => {
            if(room.roomName == this.model.roomName){
                    this.userService.addPendReq(this.currentUser,room).subscribe(() => {
                        this.loadUsersClassrooms();
                        this.model.roomName = "";
                        });
                    }
                });
            });
        }
        
        this.loading = false;
    }

    removeReq(classroom:Classroom){
        for(var i = 0; i < this.pendingReq.length; i++) {
            if(this.pendingReq[i]._id == classroom._id) {
                this.pendingReq.splice(i, 1);
                break;
            }
        }
        this.classroomService.removePendingReq(this.currentUser,classroom).subscribe(() => { 
            this.userService.removePendReq(this.currentUser, classroom).subscribe(()=>{
                this.loadUsersClassrooms();
            });
        });
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
            this.pendingReq = new Array();
            this.userService.getReqs(this.currentUser._id).subscribe(rooms => 
            { rooms.forEach( (room:string)=>{
                this.getReq(room);
            })});
            this.classrooms = new Array();
            this.userService.getClassrooms(this.currentUser._id).subscribe(rooms => 
            { rooms.forEach( (room:string)=>{
                this.getRoom(room);
            })});
        }
    }

    getRoom(cRoom: string){
        this.classroomService.getById(cRoom).subscribe(
            realRoom => { 
                this.classrooms.push(realRoom); 
        });
    }
   
    getReq(cRoom: string){
        this.classroomService.getById(cRoom).subscribe(
            realRoom => { 
                this.pendingReq.push(realRoom); 
        });
    }

    createSnippet(){
        this.loading = true;
        this.snippetModel.teacherId = this.currentUser._id;
        this.snippetService.create(this.snippetModel).subscribe(
                data => {
                    this.alertService.success('Creation successful', true);
                    this.snippetModel.name = "";
                },
                error => {
                    this.alertService.error(error._body);
                });
        this.loading = false;
        this.returnFunc();
    }

    updateSnippet(){
        this.currentSnippet.name = this.snippetModel.name;
        this.currentSnippet.code = this.snippetModel.code;
        this.loading = true;
        this.snippetService.updateSnippet(this.currentSnippet).subscribe(
                data => {
                    this.alertService.success('Update successful', true);
                    this.returnFunc();
                },
                error => {
                    this.alertService.error(error._body);
                });
        this.loading = false;
    }

    removeSnippet(snippet:Snippet){
        this.snippetService.delete(snippet._id).subscribe(
            data => {
                    this.alertService.success('Removed successfully', true);
                    this.returnFunc();
                },
            error => {
                    this.alertService.error(error._body);
                });
        this.loading = false;
    }

    createFunc(){
        this.create = true;
        this.edit = false;
        this.editing = false;
    }

    editFunc(){
        this.create = false;
        this.edit = true;
        this.editing = false;
        this.snippetService.getSnippetsForTeachId(this.currentUser._id).subscribe((snippets) => {
            this.snippets = snippets;
        });
    }
    editSnippet(snippet:Snippet){
        this.create = false;
        this.edit = false;
        this.editing= true;
        this.snippetModel.name = snippet.name;
        this.snippetModel.code = snippet.code;
        this.currentSnippet = snippet;
    }
    returnFunc(){
        this.create = false;
        this.edit = false;
        this.editing = false;
        this.snippetModel.name = "";
        this.snippetModel.code = "";
    }

     onKey(e:any){
        // // get caret position/selection
        // var start = e.selectionStart;
        // var end = e.selectionEnd;

        // var target = e.target;
        // var value = target.value;

        // // set textarea value to: text before caret + tab + text after caret
        // target.value = value.substring(0, start)
        //             + "\t"
        //             + value.substring(end);

        // // put caret at right position again (add one for the tab)
        // e.electionStart = e.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
    }
}