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
var http_1 = require("@angular/http");
var app_config_1 = require("../app.config");
var ClassroomService = (function () {
    function ClassroomService(http, config) {
        this.http = http;
        this.config = config;
    }
    ClassroomService.prototype.getAll = function () {
        return this.http.get(this.config.apiUrl + '/classrooms', this.jwt()).map(function (response) { return response.json(); });
    };
    ClassroomService.prototype.getById = function (_id) {
        return this.http.get(this.config.apiUrl + '/classrooms/' + _id, this.jwt()).map(function (response) { return response.json(); });
    };
    ClassroomService.prototype.create = function (classroom) {
        return this.http.post(this.config.apiUrl + '/classrooms/create', classroom, this.jwt());
    };
    ClassroomService.prototype.update = function (classroom) {
        return this.http.put(this.config.apiUrl + '/classrooms/' + classroom._id, classroom, this.jwt());
    };
    ClassroomService.prototype.delete = function (_id) {
        return this.http.delete(this.config.apiUrl + '/classrooms/' + _id, this.jwt());
    };
    //Specific Methods
    ClassroomService.prototype.getByTeacherId = function (teacherId) {
        return this.http.get(this.config.apiUrl + '/classrooms/teacher/' + teacherId, this.jwt()).map(function (response) { return response.json(); });
    };
    ClassroomService.prototype.getByStudentId = function (studentId) {
        return this.http.get(this.config.apiUrl + '/classrooms/student/' + studentId, this.jwt()).map(function (response) { return response.json(); });
    };
    ClassroomService.prototype.sendReq = function (roomName, student) {
        return this.http.put(this.config.apiUrl + '/classrooms/' + roomName, student, this.jwt());
    };
    ClassroomService.prototype.getReq = function (classroomid) {
        return this.http.get(this.config.apiUrl + '/classrooms/pendingReq/' + classroomid, this.jwt()).map(function (response) { return response.json(); });
    };
    // private helper methods
    ClassroomService.prototype.jwt = function () {
        // create authorization header with jwt token
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            var headers = new http_1.Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new http_1.RequestOptions({ headers: headers });
        }
    };
    return ClassroomService;
}());
ClassroomService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, app_config_1.AppConfig])
], ClassroomService);
exports.ClassroomService = ClassroomService;
//# sourceMappingURL=classroom.service.js.map