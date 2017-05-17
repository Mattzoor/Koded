import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../app.config';

import { User, Classroom, Snippet, Feedback} from '../_models/index';
import { AlertService, UserService, ClassroomService, SnippetService } from '../_services/index';
import { SnippetComponent } from '../snippetComp/index';

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
    snippet: Snippet;
    responseSnip: Snippet;
    snippets: Snippet[];
    socket: any;
    connectedUsers: User[];
    snippetUsers: User[];
    activeSnippet = false;
    reset:string;
    feedbackList: Feedback[];
    checkingFeedback = false;
    currentFeedback: Feedback;
    show = false;


    constructor(
        private router: Router,
        private classroomService: ClassroomService,
        private snippetService: SnippetService,
        private userService:UserService,
        private alertService: AlertService,
        private config: AppConfig) { 
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
            this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
            this.socket = this.socket = io(this.config.snipUrl);
            this.pendingReq = new Array();
            this.students = new Array();
            this.connectedUsers = new Array();
            this.snippetUsers = new Array();
            this.snippet = new Snippet();
            this.responseSnip = new Snippet();
        }

    ngOnInit(){
        if(this.currentUser.teacher && this.currentRoom.pendingReq != null){
            this.reloadFields();
        }
        this.socketStartUp();
    }

    reloadFields(){
        this.getPendingReq();
        this.getStudents();
        this.getSnippets();
        this.updateRoom();
    }

    ngOnDestroy(){
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'Teacher' : this.currentUser.teacher,
            'command': 'disconnected'
        });
    }

    //classroom and student handling
    getUserToReq(){
        this.pendingReq = new Array();
        this.currentRoom.pendingReq.forEach(user => {
            this.userService.getById(user).subscribe(
                (user:User) => { 
                    this.pendingReq.push(user); 
                }
            ); 
        });
    }

    getUserToStud(){
        this.students = new Array();
        this.currentRoom.students.forEach(user => {
            this.userService.getById(user).subscribe(
                (user:User) => { 
                    this.students.push(user); 
                }
            ); 
        });
    }

    getPendingReq(){
        this.classroomService.getPendingReq(this.currentRoom._id).subscribe(
            data => {   this.currentRoom.pendingReq = data;
                        this.getUserToReq();    
                }
        );
    }

    getStudents(){
        this.classroomService.getStudents(this.currentRoom._id).subscribe(
            data => {   this.currentRoom.students = data;
                        this.getUserToStud();    
                }
        );
    }

    acceptPendingReq(student:User){
        this.classroomService.acceptPendingReq(student, this.currentRoom).subscribe(
            data => {
                this.userService.updateRooms(student,this.currentRoom).subscribe(()=>{
                    this.reloadFields();
                });
            }
        );    
    }

    removePendingReq(student:User){
        this.classroomService.removePendingReq(student, this.currentRoom).subscribe(
            () => {
                this.userService.removePendReq(student,this.currentRoom).subscribe(() => 
                {this.reloadFields();}); 
        });    
    }

    removeStudent(student:User){
        this.classroomService.removeStud(student, this.currentRoom).subscribe(
            () => {
                this.userService.removeStud(student,this.currentRoom).subscribe(() => 
                {
                    this.reloadFields();
                });
        });
    }

    //Snippet handling    
    getSnippets(){
        this.snippetService.getSnippetsForTeachId(this.currentUser._id).subscribe((snippets) => {
            console.log(snippets);
            this.snippets = snippets;
            this.snippets.forEach(snip => {
                if(snip.feedback == undefined){
                    snip.feedback= new Array();
                }
            });
        });
    };

    saveSnippet(){
        this.snippetService.saveSnippet(this.snippet).subscribe(() => {
            this.getSnippets();
        });
    }
    sendSnippet(snippet: Snippet){
        this.snippetUsers = this.connectedUsers;
        this.connectedUsers = new Array();
        this.snippet = snippet;
        this.data.snippet = snippet;
        this.activeSnippet = true;
        this.socket.emit('snippet',{
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
			'snipname': snippet.name,
			'code': snippet.code,
			'command': "sendSnip"
        });
    }

    responseSnippet(){
        this.activeSnippet = false;
        this.responseSnip.code = this.snippet.code;
        this.socket.emit('snippet',{
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
			'snipname': this.snippet.name,
			'code': this.responseSnip.code,
			'command': "responseSnip"
        });
        this.snippet = new Snippet();
    }
    
    resetSnippet(){
        this.snippet.code = this.reset;
    }

    updateRoom(){
        this.connectedUsers = new Array();
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
            'command':'checkUsers'
        });
    }

    socketStartUp(){
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
            'command':'connected'
        });
        this.socket.on('roomUpdate', function(data:any) {
            console.log(data.command);
            if(data.classroom == this.currentRoom._id){
                if(data.command == 'connected'){
                    var user = new User();
                    user.username = data.username;
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    console.log(user);
                    this.connectedUsers.push(user);
                }
                if(data.command == 'checkUsers'){
                    console.log(data.classroom + '+' + this.currentRoom._id);
                    if(data.classroom == this.currentRoom._id){
                        this.socket.emit('newConnected', {
                            'classroom': this.currentRoom._id,
                            'username': this.currentUser.username,
                            'firstName': this.currentUser.firstName,
                            'lastName': this.currentUser.lastName,
                            'isTeacher' : this.currentUser.teacher,
                            'command':'connected'
                        });
                    }
                }
                if(data.command == 'disconnected'){
                    var user = new User();
                    user.username = data.username;
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    for(var i = 0; i < this.connectedUsers.length; i++) {
                        if(this.connectedUsers[i].username == user.username) {
                            this.connectedUsers.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }.bind(this));

        this.socket.on('snipUpdate', function(data:any) {
            if(data.classroom == this.currentRoom._id){
                if(data.command == 'newSnip'){

                }
                if(data.command == 'sendSnip'){
                    if(data.classroom == this.currentRoom._id){
                        if(!this.currentUser.teacher){
                            if(this.snippet.name != data.snipname){
                                this.snippet.name = data.snipname;
                                this.snippet.code = data.code;
                                this.activeSnippet = true;
                                this.reset = data.code;
                            }
                        }
                    }
                }
                if(data.command == 'responseSnip'){
                    if(this.currentUser.teacher){
                        if(this.snippet.feedback == undefined){
                            this.snippet.feedback = new Array();
                        }

                        this.snippet.feedback.push(
                            'Classroom: ' + data.classroom +'\n'+ 
                            'Date: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() +'\n'+
                            'Student:' + data.username + ' ' + data.firstName + ' ' + data.lastName + '\n' + 
                            'code:\n' +
                            data.code 
                        );
                        console.log(this.snippet.feedback);
                        for(var i = 0; i < this.snippetUsers.length; i++) {
                            if(this.snippetUsers[i].username == data.username) {
                                this.snippetUsers.splice(i, 1);
                                var user = new User();
                                user.username = data.username;
                                user.firstName = data.firstName;
                                user.lastName = data.lastName;
                                this.connectedUsers.push(user);
                                --i;
                            }else{
                                if(this.snippetUsers[i].username == this.currentUser.username){
                                    this.snippetUsers.splice(i, 1);
                                    --i;
                                }
                            }    
                        }
                        console.log(this.snippetUsers);
                        if(this.snippetUsers.length == 0){
                                this.activeSnippet = false;
                                this.saveSnippet();
                        }
                    }
                }
            }
        }.bind(this));
    }

    checkFeedback(snippet:Snippet){

        this.feedbackList = new Array();
        snippet.feedback.forEach(feed => {
            feed.split('\n');console.log(feed);
        });
        this.checkingFeedback = true;
    }
    doneCheckingFeedback(){
        this.feedbackList = new Array();
        this.checkingFeedback = false;
    }

    showSnip(){
        this.show=true;
    }
    hideSnip(){
        this.show =false;
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
