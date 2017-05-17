import { Component, OnInit,NgModule, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../app.config';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { User, Classroom, Snippet, Feedback} from '../_models/index';
import { AlertService, UserService, ClassroomService, SnippetService } from '../_services/index';

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
    feedbackList: string[];
    checkingFeedback = false;
    currentFeedback: Feedback;
    snippetStrings:string[];
    input: any[];
    feedbackArray: any[][];

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
        this.activeSnippet = true;
        this.socket.emit('snippet',{
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
			'snipname': snippet.name,
			'code': snippet.code,
            'desc': snippet.desc,
			'command': "sendSnip"
        });
    }

    responseSnippet(myForm:any){
        var stringfid = JSON.stringify(myForm.form.value.inputs).split('... .- - .- -.'); //the key to life itself
        stringfid[0] = stringfid[0].substring(1,stringfid[0].length-1);
        stringfid[stringfid.length-1] = stringfid[stringfid.length-1].substring(1,stringfid[stringfid.length-1].length-1);
        var input = new Array();
        for(var i = 0; i < stringfid.length;i++){
            if(stringfid[i].substring(0,3)=='":"'){
                input.push(stringfid[i].substring(3,stringfid[i].length-3));
            }
            if(stringfid[i].substring(0,2)== ':"'){
                input.push(stringfid[i].substring(2,stringfid[i].length-1));
            }
        }
        var resCode = "";
        for(var i = 0; i < this.snippetStrings.length; i++){
            if(this.snippetStrings[i] != ' '){
                resCode += this.snippetStrings[i];
            }
            if(i < input.length){
                resCode += "<filled>";
                resCode += input[i];
                resCode += "<filled>";
            }                
        }

        this.activeSnippet = false;
        this.socket.emit('snippet',{
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
			'snipname': this.snippet.name,
			'code': resCode,
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
            if(data.classroom == this.currentRoom._id){
                if(data.command == 'connected'){
                    var user = new User();
                    user.username = data.username;
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    var check = false;
                    this.connectedUsers.forEach((user:User) =>{
                        if(user.username==data.username){
                            check = true;
                        }
                    });
                    if(!check){
                        this.connectedUsers.push(user);
                    }
                }
                if(data.command == 'checkUsers'){
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
                                this.snippet.desc = data.desc;
                                this.activeSnippet = true;
                                this.reset = data.code; 
                                this.snippetStrings = new Array();
                                
                                var tmp = this.snippet.code.split('<fill>');
                                tmp.forEach((s:string) => {
                                    this.snippetStrings.push(s);
                                });
                                if(this.snippet.code.substring(0,6)== '<fill>'){
                                    this.snippetStrings[0]=' ';
                                }
                                this.input = new Array();
                                for(var i = 0; i < this.snippetStrings.length; i++){
                                    this.input.push({ name:'input'+i, type: 'text', value: ''});
                                }
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
                            'Student:' + data.username + ', ' + data.firstName + ' ' + data.lastName + '\n' + 
                            'code:\n' +
                            data.code 
                        );
                        
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

        this.feedbackArray = new Array(Array());
        snippet.feedback.forEach(feed=>{
            var classroom= new Array();
            classroom= feed.split('Date:');
            if(classroom[0].substring(11,classroom[0].length-1)==this.currentRoom._id){
                var tmp = feed.split(this.currentRoom._id+'\n');  
                var tmp2 = new Array();  
                tmp2 = tmp[1].split("<filled>");
                this.feedbackArray.push(tmp2);
            }
        });
        this.feedbackList = snippet.feedback;
        this.checkingFeedback = true;
    }
    doneCheckingFeedback(){
        this.feedbackList = new Array();
        this.checkingFeedback = false;
    }

    onKey(e:any){
        e.preventDefault();
    }

}
