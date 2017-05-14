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
var index_1 = require("../_services/index");
var HomeComponent = (function () {
    function HomeComponent(router, classroomService, userService, snippetService, alertService, roomAuthService) {
        this.router = router;
        this.classroomService = classroomService;
        this.userService = userService;
        this.snippetService = snippetService;
        this.alertService = alertService;
        this.roomAuthService = roomAuthService;
        this.classrooms = [];
        this.pendingReq = [];
        this.model = {};
        this.snippetModel = {};
        this.snippets = [];
        this.loading = false;
        this.create = false;
        this.edit = false;
        this.editing = false;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    HomeComponent.prototype.ngOnInit = function () {
        this.loadUsersClassrooms();
        this.roomAuthService.exitRoom();
    };
    HomeComponent.prototype.createClassroom = function () {
        var _this = this;
        this.loading = true;
        this.model.teacherId = this.currentUser._id;
        this.classroomService.create(this.model)
            .subscribe(function (data) {
            _this.alertService.success('Registration successful', true);
            _this.loadUsersClassrooms();
        }, function (error) {
            _this.alertService.error(error._body);
        });
        this.loading = false;
    };
    HomeComponent.prototype.enterRoom = function (_id) {
        var _this = this;
        this.loading = true;
        if (this.currentUser.teacher) {
            this.roomAuthService.enterRoom(_id).subscribe(function (data) {
                _this.router.navigate(['/classroom']);
            }, function (error) {
                _this.alertService.error(error._body);
            });
        }
        else {
            this.userService.checkRoom(this.currentUser, _id).subscribe(function (data) {
                console.log("(data)");
                _this.roomAuthService.enterRoom(_id).subscribe(function (data) {
                    _this.router.navigate(['/classroom']);
                }, function (error) {
                    _this.alertService.error(error._body);
                });
                _this.loading = false;
            }, function (error) {
                console.log("error");
                _this.alertService.error("Not memeber of room");
                _this.loading = false;
            });
        }
        this.loadUsersClassrooms();
        this.loading = false;
    };
    HomeComponent.prototype.exitClassroom = function (room) {
        var _this = this;
        for (var i = 0; i < this.classrooms.length; i++) {
            if (this.classrooms[i]._id == room._id) {
                this.classrooms.splice(i, 1);
                break;
            }
        }
        this.userService.exitClassroom(this.currentUser._id, room).subscribe(function () {
            _this.classroomService.removeStud(_this.currentUser, room).subscribe(function () {
                _this.loadUsersClassrooms();
            });
        });
    };
    HomeComponent.prototype.sendReqToClassroom = function () {
        var _this = this;
        this.loading = true;
        this.pendingReq.forEach(function (room) {
            if (room.roomName.toLowerCase() == _this.model.roomName.toLowerCase()) {
                _this.loading = false;
            }
        });
        this.classrooms.forEach(function (room) {
            if (room.roomName.toLowerCase() == _this.model.roomName.toLowerCase()) {
                _this.loading = false;
            }
        });
        if (this.loading == true) {
            this.classroomService.sendReq(this.model.roomName, this.currentUser).subscribe(function () {
                _this.classroomService.getByName(_this.model.roomName).subscribe(function (room) {
                    if (room.roomName == _this.model.roomName) {
                        _this.userService.addPendReq(_this.currentUser, room).subscribe(function () {
                            _this.loadUsersClassrooms();
                            _this.model.roomName = "";
                        });
                    }
                });
            });
        }
        this.loading = false;
    };
    HomeComponent.prototype.removeReq = function (classroom) {
        var _this = this;
        for (var i = 0; i < this.pendingReq.length; i++) {
            if (this.pendingReq[i]._id == classroom._id) {
                this.pendingReq.splice(i, 1);
                break;
            }
        }
        this.classroomService.removePendingReq(this.currentUser, classroom).subscribe(function () {
            _this.userService.removePendReq(_this.currentUser, classroom).subscribe(function () {
                _this.loadUsersClassrooms();
            });
        });
    };
    HomeComponent.prototype.deleteClassroom = function (_id) {
        var _this = this;
        this.classroomService.delete(_id).subscribe(function () { _this.loadUsersClassrooms(); });
    };
    HomeComponent.prototype.loadAllClassrooms = function () {
        var _this = this;
        this.classroomService.getAll().subscribe(function (classrooms) { _this.classrooms = classrooms; });
    };
    HomeComponent.prototype.loadUsersClassrooms = function () {
        var _this = this;
        if (this.currentUser.teacher) {
            this.classroomService.getByTeacherId(this.currentUser._id).subscribe(function (classrooms) { _this.classrooms = classrooms; });
        }
        else {
            this.pendingReq = new Array();
            this.userService.getReqs(this.currentUser._id).subscribe(function (rooms) {
                rooms.forEach(function (room) {
                    _this.getReq(room);
                });
            });
            this.classrooms = new Array();
            this.userService.getClassrooms(this.currentUser._id).subscribe(function (rooms) {
                rooms.forEach(function (room) {
                    _this.getRoom(room);
                });
            });
        }
    };
    HomeComponent.prototype.getRoom = function (cRoom) {
        var _this = this;
        this.classroomService.getById(cRoom).subscribe(function (realRoom) {
            _this.classrooms.push(realRoom);
        });
    };
    HomeComponent.prototype.getReq = function (cRoom) {
        var _this = this;
        this.classroomService.getById(cRoom).subscribe(function (realRoom) {
            _this.pendingReq.push(realRoom);
        });
    };
    HomeComponent.prototype.createSnippet = function () {
        var _this = this;
        this.loading = true;
        this.snippetModel.teacherId = this.currentUser._id;
        this.snippetService.create(this.snippetModel).subscribe(function (data) {
            _this.alertService.success('Creation successful', true);
            _this.snippetModel.name = "";
        }, function (error) {
            _this.alertService.error(error._body);
        });
        this.loading = false;
        this.returnFunc();
    };
    HomeComponent.prototype.updateSnippet = function () {
        var _this = this;
        this.currentSnippet.name = this.snippetModel.name;
        this.currentSnippet.code = this.snippetModel.code;
        this.loading = true;
        this.snippetService.updateSnippet(this.currentSnippet).subscribe(function (data) {
            _this.alertService.success('Update successful', true);
            _this.returnFunc();
        }, function (error) {
            _this.alertService.error(error._body);
        });
        this.loading = false;
    };
    HomeComponent.prototype.removeSnippet = function (snippet) {
        var _this = this;
        this.snippetService.delete(snippet._id).subscribe(function (data) {
            _this.alertService.success('Removed successfully', true);
            _this.returnFunc();
        }, function (error) {
            _this.alertService.error(error._body);
        });
        this.loading = false;
    };
    HomeComponent.prototype.createFunc = function () {
        this.create = true;
        this.edit = false;
        this.editing = false;
    };
    HomeComponent.prototype.editFunc = function () {
        var _this = this;
        this.create = false;
        this.edit = true;
        this.editing = false;
        this.snippetService.getSnippetsForTeachId(this.currentUser._id).subscribe(function (snippets) {
            _this.snippets = snippets;
        });
    };
    HomeComponent.prototype.editSnippet = function (snippet) {
        this.create = false;
        this.edit = false;
        this.editing = true;
        this.snippetModel.name = snippet.name;
        this.snippetModel.code = snippet.code;
        this.currentSnippet = snippet;
    };
    HomeComponent.prototype.returnFunc = function () {
        this.create = false;
        this.edit = false;
        this.editing = false;
        this.snippetModel.name = "";
        this.snippetModel.code = "";
    };
    HomeComponent.prototype.onKey = function (e) {
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
    return HomeComponent;
}());
HomeComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        templateUrl: 'home.component.html'
    }),
    __metadata("design:paramtypes", [router_1.Router,
        index_1.ClassroomService,
        index_1.UserService,
        index_1.SnippetService,
        index_1.AlertService,
        index_1.RoomAuthService])
], HomeComponent);
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map