import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../app.config';

import { User, Classroom, Snippet } from '../_models/index';
import { AlertService, UserService, ClassroomService, SnippetService } from '../_services/index';

@Component({
    moduleId: module.id,
    selector: 'snippet',
    templateUrl: 'snippetComp.component.html'
})

export class SnippetComponent implements OnInit {
    message:string = "";
    conversation:string[];
    socket:any;
    currentUser: User;
    currentRoom: Classroom;
    user:User;
    users: User[];
    data: any = {};
 
    constructor(
        private _router: Router,
        private config: AppConfig){}
 
    ngOnInit() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
        this.socket = io(this.config.snipUrl);
        this.conversation = new Array();
        this.users = new Array();
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom.roomName,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher' : this.currentUser.teacher,
            'command':'connected'
        });
        this.socket.on('connected', function(data:string){
            //this.users.push(data);
        }.bind(this));
        this.socket.on('roomUpdate', function(data:any) {
            console.log(data.command);
            //console.log(
			//		'\n classroom: '+ data.classroom +
            //		'\n username: ' + data.username +
            //		'\n firstName: '+ data.firstName +
            //		'\n lastName: '+ data.lastName +
            //		'\n isTeacher: ' + data.isTeacher);
        
            
            if(data.command == 'connected'){
                this.user = new User();
                this.user.username = data.username;
                this.user.firstName = data.firstName;
                this.user.lastName = data.lastName;
                console.log(this.user);
                this.users.push(this.user);
            }
            if(data.command == 'disconnected'){
                for(var i = 0; i < this.users.length; i++) {
                    if(this.users[i].username == this.user.username) {
                        this.users.splice(i, 1);
                        break;
                    }
                }
            }
        }.bind(this));
        console.log(this.users);
    }
    
    ngOnDestoy(){
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom.roomName,
            'userName': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'Teacher' : this.currentUser.teacher,
            'command': 'disconnected'
        });
    }
    send() {
        this.socket.emit('newMessage', {
            'classroom': this.currentRoom.roomName,
            'userName': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'Teacher' : this.currentUser.teacher
        });
        this.message = '';
    }

    isNewUserAlert(data:any){
        //console.log(data);  
        return data.userName === '';
    }
    
}
