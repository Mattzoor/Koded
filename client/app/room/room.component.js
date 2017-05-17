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
        this.activeSnippet = true;
        this.socket.emit('snippet', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher': this.currentUser.teacher,
            'snipname': snippet.name,
            'code': snippet.code,
            'desc': snippet.desc,
            'command': "sendSnip"
        });
    };
    RoomComponent.prototype.responseSnippet = function (myForm) {
        var stringfid = JSON.stringify(myForm.form.value.inputs).split('... .- - .- -.'); //the key to life itself
        stringfid[0] = stringfid[0].substring(1, stringfid[0].length - 1);
        stringfid[stringfid.length - 1] = stringfid[stringfid.length - 1].substring(1, stringfid[stringfid.length - 1].length - 1);
        var input = new Array();
        for (var i = 0; i < stringfid.length; i++) {
            if (stringfid[i].substring(0, 3) == '":"') {
                input.push(stringfid[i].substring(3, stringfid[i].length - 3));
            }
            if (stringfid[i].substring(0, 2) == ':"') {
                input.push(stringfid[i].substring(2, stringfid[i].length - 1));
            }
        }
        var resCode = "";
        for (var i = 0; i < this.snippetStrings.length; i++) {
            if (this.snippetStrings[i] != ' ') {
                resCode += this.snippetStrings[i];
            }
            if (i < input.length) {
                resCode += "<filled>";
                resCode += input[i];
                resCode += "<filled>";
            }
        }
        this.activeSnippet = false;
        this.socket.emit('snippet', {
            'classroom': this.currentRoom._id,
            'username': this.currentUser.username,
            'firstName': this.currentUser.firstName,
            'lastName': this.currentUser.lastName,
            'isTeacher': this.currentUser.teacher,
            'snipname': this.snippet.name,
            'code': resCode,
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
            if (data.classroom == this.currentRoom._id) {
                if (data.command == 'connected') {
                    var user = new index_1.User();
                    user.username = data.username;
                    user.firstName = data.firstName;
                    user.lastName = data.lastName;
                    var check = false;
                    this.connectedUsers.forEach(function (user) {
                        if (user.username == data.username) {
                            check = true;
                        }
                    });
                    if (!check) {
                        this.connectedUsers.push(user);
                    }
                }
                if (data.command == 'checkUsers') {
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
            var _this = this;
            if (data.classroom == this.currentRoom._id) {
                if (data.command == 'newSnip') {
                }
                if (data.command == 'sendSnip') {
                    if (data.classroom == this.currentRoom._id) {
                        if (!this.currentUser.teacher) {
                            if (this.snippet.name != data.snipname) {
                                this.snippet.name = data.snipname;
                                this.snippet.code = data.code;
                                this.snippet.desc = data.desc;
                                this.activeSnippet = true;
                                this.reset = data.code;
                                this.snippetStrings = new Array();
                                var tmp = this.snippet.code.split('<fill>');
                                tmp.forEach(function (s) {
                                    _this.snippetStrings.push(s);
                                });
                                if (this.snippet.code.substring(0, 6) == '<fill>') {
                                    this.snippetStrings[0] = ' ';
                                }
                                this.input = new Array();
                                for (var i = 0; i < this.snippetStrings.length; i++) {
                                    this.input.push({ name: 'input' + i, type: 'text', value: '' });
                                }
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
                            'Student:' + data.username + ', ' + data.firstName + ' ' + data.lastName + '\n' +
                            'code:\n' +
                            data.code);
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
        var _this = this;
        this.feedbackArray = new Array(Array());
        snippet.feedback.forEach(function (feed) {
            var classroom = new Array();
            classroom = feed.split('Date:');
            if (classroom[0].substring(11, classroom[0].length - 1) == _this.currentRoom._id) {
                var tmp = feed.split(_this.currentRoom._id + '\n');
                var tmp2 = new Array();
                tmp2 = tmp[1].split("<filled>");
                _this.feedbackArray.push(tmp2);
            }
        });
        this.feedbackList = snippet.feedback;
        this.checkingFeedback = true;
    };
    RoomComponent.prototype.doneCheckingFeedback = function () {
        this.feedbackList = new Array();
        this.checkingFeedback = false;
    };
    RoomComponent.prototype.onKey = function (e) {
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