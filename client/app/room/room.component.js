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
    function RoomComponent(router, classroomService, alertService) {
        this.router = router;
        this.classroomService = classroomService;
        this.alertService = alertService;
        this.model = {};
        this.loading = false;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
    }
    RoomComponent.prototype.ngOnInit = function () {
        if (this.currentUser.teacher) {
            this.getReq();
        }
    };
    RoomComponent.prototype.getReq = function () {
        var _this = this;
        this.classroomService.getReq(this.currentRoom._id).subscribe(function (user) {
            _this.pendingReq = user;
            console.log(user);
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
        index_1.AlertService])
], RoomComponent);
exports.RoomComponent = RoomComponent;
//# sourceMappingURL=room.component.js.map