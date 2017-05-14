"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var app_config_1 = require("../app.config");
var index_1 = require("../_models/index");
var SnippetComponent = (function () {
    function SnippetComponent(_router, config) {
        this._router = _router;
        this.config = config;
        this.message = "";
        this.data = {};
    }
    SnippetComponent.prototype.ngOnInit = function () {
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
            'isTeacher': this.currentUser.teacher,
            'command': 'connected'
        });
        this.socket.on('connected', function (data) {
            //this.users.push(data);
        }.bind(this));
        this.socket.on('roomUpdate', function (data) {
            console.log(data.command);
            //console.log(
            //		'\n classroom: '+ data.classroom +
            //		'\n username: ' + data.username +
            //		'\n firstName: '+ data.firstName +
            //		'\n lastName: '+ data.lastName +
            //		'\n isTeacher: ' + data.isTeacher);
            if (data.command == 'connected') {
                this.user = new index_1.User();
                this.user.username = data.username;
                this.user.firstName = data.firstName;
                this.user.lastName = data.lastName;
                console.log(this.user);
                this.users.push(this.user);
            }
            if (data.command == 'disconnected') {
                for (var i = 0; i < this.users.length; i++) {
                    if (this.users[i].username == this.user.username) {
                        this.users.splice(i, 1);
                        break;
                    }
                }
            }
        }.bind(this));
        console.log(this.users);
    };
    SnippetComponent.prototype.ngOnDestoy = function () {
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom.roomName,
            'userName': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'Teacher': this.currentUser.teacher,
            'command': 'disconnected'
        });
    };
    SnippetComponent.prototype.send = function () {
        this.socket.emit('newMessage', {
            'classroom': this.currentRoom.roomName,
            'userName': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'Teacher': this.currentUser.teacher
        });
        this.message = '';
    };
    SnippetComponent.prototype.isNewUserAlert = function (data) {
        //console.log(data);  
        return data.userName === '';
    };
    return SnippetComponent;
}());
SnippetComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'snippet',
        templateUrl: 'snippetComp.component.html'
    }),
    __metadata("design:paramtypes", [router_1.Router,
        app_config_1.AppConfig])
], SnippetComponent);
exports.SnippetComponent = SnippetComponent;
//# sourceMappingURL=snippetComp.component.js.map