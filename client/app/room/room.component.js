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
var RoomComponent = (function () {
    function RoomComponent(router, classroomService, userService, alertService) {
        this.router = router;
        this.classroomService = classroomService;
        this.userService = userService;
        this.alertService = alertService;
        this.model = {};
        this.loading = false;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
        this.pendingReq = new Array();
        this.students = new Array();
    }
    RoomComponent.prototype.ngOnInit = function () {
        if (this.currentUser.teacher && this.currentRoom.pendingReq != null) {
            this.reloadFields();
        }
    };
    RoomComponent.prototype.reloadFields = function () {
        this.getPendingReq();
        this.getStudents();
    };
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
            _this.reloadFields();
            _this.userService.updateRooms(student, _this.currentRoom).subscribe();
        });
    };
    RoomComponent.prototype.removePendingReq = function (student) {
        var _this = this;
        this.classroomService.removePendingReq(student, this.currentRoom).subscribe(function (data) {
            _this.reloadFields();
            _this.userService.removePendReq(student, _this.currentRoom).subscribe();
        });
    };
    RoomComponent.prototype.removeStudent = function (student) {
        var _this = this;
        this.classroomService.removeStud(student, this.currentRoom).subscribe(function (data) {
            _this.reloadFields();
            _this.userService.removeStud(student, _this.currentRoom).subscribe();
        });
    };
    return RoomComponent;
}());
RoomComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        templateUrl: 'room.component.html'
    }),
    __metadata("design:paramtypes", [router_1.Router,
        index_1.ClassroomService,
        index_1.UserService,
        index_1.AlertService])
], RoomComponent);
exports.RoomComponent = RoomComponent;
//# sourceMappingURL=room.component.js.map