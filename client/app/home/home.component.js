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
    function HomeComponent(router, classroomService, userService, alertService, roomAuthService) {
        this.router = router;
        this.classroomService = classroomService;
        this.userService = userService;
        this.alertService = alertService;
        this.roomAuthService = roomAuthService;
        this.classrooms = [];
        this.model = {};
        this.loading = false;
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
        this.roomAuthService.enterRoom(_id)
            .subscribe(function (data) {
            _this.router.navigate(['/classroom']);
        }, function (error) {
            _this.alertService.error(error._body);
            _this.loading = false;
        });
    };
    HomeComponent.prototype.sendReqToClassroom = function () {
        var _this = this;
        this.loading = true;
        this.classroomService.sendReq(this.model.roomName, this.currentUser).subscribe(function (data) {
            _this.loadUsersClassrooms();
            _this.classrooms.forEach(function (room) {
                if (room.roomName.localeCompare(_this.model.roomName)) {
                    _this.userService.addPendReq(_this.currentUser, room);
                }
            });
        });
        this.loading = false;
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
            this.classroomService.getByStudentId(this.currentUser._id).subscribe(function (classrooms) { _this.classrooms = classrooms; });
        }
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
        index_1.AlertService,
        index_1.RoomAuthService])
], HomeComponent);
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=home.component.js.map