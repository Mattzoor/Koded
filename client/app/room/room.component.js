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
var index_2 = require("../_services/index");
var RoomComponent = (function () {
    function RoomComponent(router, classroomService, snippetService, userService, alertService, config) {
        this.router = router;
        this.classroomService = classroomService;
        this.snippetService = snippetService;
        this.userService = userService;
        this.alertService = alertService;
        this.config = config;
        this.model = {};
        this.loading = false;
        this.activeSnippet = false;
        this.checkingFeedback = false;
        this.show = false;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
        this.socket = this.socket = io(this.config.snipUrl);
        this.pendingReq = new Array();
        this.students = new Array();
        this.connectedUsers = new Array();
        this.snippetUsers = new Array();
        this.snippet = new index_1.Snippet();
        this.responseSnip = new index_1.Snippet();
    }
    RoomComponent.prototype.ngOnInit = function () {
        if (this.currentUser.teacher && this.currentRoom.pendingReq != null) {
            this.reloadFields();
        }
        this.socketStartUp();
    };
    RoomComponent.prototype.reloadFields = function () {
        this.getPendingReq();
        this.getStudents();
        this.getSnippets();
        this.updateRoom();
    };
    RoomComponent.prototype.ngOnDestroy = function () {
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'Teacher': this.currentUser.teacher,
            'command': 'disconnected'
        });
    };
    //classroom and student handling
    RoomComponent.prototype.getUserToReq = function () {
        var _this = this;
        this.pendingReq = new Array();
        this.currentRoom.pendingReq.forEach(function (user) {
            _this.userService.getById(user).subscribe(function (user) {
                _this.pendingReq.push(user);
            });
        });
    };
    RoomComponent.prototype.getUserToStud = function () {
        var _this = this;
        this.students = new Array();
        this.currentRoom.students.forEach(function (user) {
            _this.userService.getById(user).subscribe(function (user) {
                _this.students.push(user);
            });
        });
    };
    RoomComponent.prototype.getPendingReq = function () {
        var _this = this;
        this.classroomService.getPendingReq(this.currentRoom._id).subscribe(function (data) {
            _this.currentRoom.pendingReq = data;
            _this.getUserToReq();
        });
    };
    RoomComponent.prototype.getStudents = function () {
        var _this = this;
        this.classroomService.getStudents(this.currentRoom._id).subscribe(function (data) {
            _this.currentRoom.students = data;
            _this.getUserToStud();
        });
    };
    RoomComponent.prototype.acceptPendingReq = function (student) {
        var _this = this;
        this.classroomService.acceptPendingReq(student, this.currentRoom).subscribe(function (data) {
            _this.userService.updateRooms(student, _this.currentRoom).subscribe(function () {
                _this.reloadFields();
            });
        });
    };
    RoomComponent.prototype.removePendingReq = function (student) {
        var _this = this;
        this.classroomService.removePendingReq(student, this.currentRoom).subscribe(function () {
            _this.userService.removePendReq(student, _this.currentRoom).subscribe(function () { _this.reloadFields(); });
        });
    };
    RoomComponent.prototype.removeStudent = function (student) {
        var _this = this;
        this.classroomService.removeStud(student, this.currentRoom).subscribe(function () {
            _this.userService.removeStud(student, _this.currentRoom).subscribe(function () {
                _this.reloadFields();
            });
        });
    };
    //Snippet handling    
    RoomComponent.prototype.getSnippets = function () {
        var _this = this;
        this.snippetService.getSnippetsForTeachId(this.currentUser._id).subscribe(function (snippets) {
            console.log(snippets);
            _this.snippets = snippets;
            _this.snippets.forEach(function (snip) {
                if (snip.feedback == undefined) {
                    snip.feedback = new Array();
                }
            });
        });
    };
    ;
    RoomComponent.prototype.saveSnippet = function () {
        var _this = this;
        this.snippetService.saveSnippet(this.snippet).subscribe(function () {
            _this.getSnippets();
        });
    };
    RoomComponent.prototype.sendSnippet = function (snippet) {
        this.snippetUsers = this.connectedUsers;
        this.connectedUsers = new Array();
        this.snippet = snippet;
        this.data.snippet = snippet;
        this.activeSnippet = true;
        this.socket.emit('snippet', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher': this.currentUser.teacher,
            'snipname': snippet.name,
            'code': snippet.code,
            'command': "sendSnip"
        });
    };
    RoomComponent.prototype.responseSnippet = function () {
        this.activeSnippet = false;
        this.responseSnip.code = this.snippet.code;
        this.socket.emit('snippet', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher': this.currentUser.teacher,
            'snipname': this.snippet.name,
            'code': this.responseSnip.code,
            'command': "responseSnip"
        });
        this.snippet = new index_1.Snippet();
    };
    RoomComponent.prototype.resetSnippet = function () {
        this.snippet.code = this.reset;
    };
    RoomComponent.prototype.updateRoom = function () {
        this.connectedUsers = new Array();
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher': this.currentUser.teacher,
            'command': 'checkUsers'
        });
    };
    RoomComponent.prototype.socketStartUp = function () {
        this.socket.emit('newConnected', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher': this.currentUser.teacher,
            'command': 'connected'
        });
        this.socket.on('roomUpdate', function (data) {
            console.log(data.command);
            if (data.classroom == this.currentRoom._id) {
                if (data.command == 'connected') {
                    var user = new index_1.User();
                    user.username = data.username;
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    console.log(user);
                    this.connectedUsers.push(user);
                }
                if (data.command == 'checkUsers') {
                    console.log(data.classroom + '+' + this.currentRoom._id);
                    if (data.classroom == this.currentRoom._id) {
                        this.socket.emit('newConnected', {
                            'classroom': this.currentRoom._id,
                            'username': this.currentUser.username,
                            'firstName': this.currentUser.firstName,
                            'lastName': this.currentUser.lastName,
                            'isTeacher': this.currentUser.teacher,
                            'command': 'connected'
                        });
                    }
                }
                if (data.command == 'disconnected') {
                    var user = new index_1.User();
                    user.username = data.username;
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    for (var i = 0; i < this.connectedUsers.length; i++) {
                        if (this.connectedUsers[i].username == user.username) {
                            this.connectedUsers.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }.bind(this));
        this.socket.on('snipUpdate', function (data) {
            if (data.classroom == this.currentRoom._id) {
                if (data.command == 'newSnip') {
                }
                if (data.command == 'sendSnip') {
                    if (data.classroom == this.currentRoom._id) {
                        if (!this.currentUser.teacher) {
                            if (this.snippet.name != data.snipname) {
                                this.snippet.name = data.snipname;
                                this.snippet.code = data.code;
                                this.activeSnippet = true;
                                this.reset = data.code;
                            }
                        }
                    }
                }
                if (data.command == 'responseSnip') {
                    if (this.currentUser.teacher) {
                        if (this.snippet.feedback == undefined) {
                            this.snippet.feedback = new Array();
                        }
                        this.snippet.feedback.push('Classroom: ' + data.classroom + '\n' +
                            'Date: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() + '\n' +
                            'Student:' + data.username + ' ' + data.firstName + ' ' + data.lastName + '\n' +
                            'code:\n' +
                            data.code);
                        console.log(this.snippet.feedback);
                        for (var i = 0; i < this.snippetUsers.length; i++) {
                            if (this.snippetUsers[i].username == data.username) {
                                this.snippetUsers.splice(i, 1);
                                var user = new index_1.User();
                                user.username = data.username;
                                user.firstName = data.firstName;
                                user.lastName = data.lastName;
                                this.connectedUsers.push(user);
                                --i;
                            }
                            else {
                                if (this.snippetUsers[i].username == this.currentUser.username) {
                                    this.snippetUsers.splice(i, 1);
                                    --i;
                                }
                            }
                        }
                        console.log(this.snippetUsers);
                        if (this.snippetUsers.length == 0) {
                            this.activeSnippet = false;
                            this.saveSnippet();
                        }
                    }
                }
            }
        }.bind(this));
    };
    RoomComponent.prototype.checkFeedback = function (snippet) {
        this.feedbackList = new Array();
        snippet.feedback.forEach(function (feed) {
            feed.split('\n');
            console.log(feed);
        });
        this.checkingFeedback = true;
    };
    RoomComponent.prototype.doneCheckingFeedback = function () {
        this.feedbackList = new Array();
        this.checkingFeedback = false;
    };
    RoomComponent.prototype.showSnip = function () {
        this.show = true;
    };
    RoomComponent.prototype.hideSnip = function () {
        this.show = false;
    };
    RoomComponent.prototype.onKey = function (e) {
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
    };
    return RoomComponent;
}());
RoomComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        templateUrl: 'room.component.html'
    }),
    __metadata("design:paramtypes", [router_1.Router,
        index_2.ClassroomService,
        index_2.SnippetService,
        index_2.UserService,
        index_2.AlertService,
        app_config_1.AppConfig])
], RoomComponent);
exports.RoomComponent = RoomComponent;
//# sourceMappingURL=room.component.js.map