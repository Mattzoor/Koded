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
require("rxjs/add/operator/map");
var app_config_1 = require("../app.config");
var RoomAuthService = (function () {
    function RoomAuthService(http, config) {
        this.http = http;
        this.config = config;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    RoomAuthService.prototype.enterRoom = function (_id) {
        return this.http.post(this.config.apiUrl + '/classrooms/authenticate', { _id: _id }, this.jwt())
            .map(function (response) {
            // login successful if there's a jwt token in the response
            var room = response.json();
            if (room) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentRoom', JSON.stringify(room));
            }
        });
    };
    RoomAuthService.prototype.exitRoom = function () {
        localStorage.removeItem('currentRoom');
    };
    RoomAuthService.prototype.jwt = function () {
        // create authorization header with jwt token
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            var headers = new http_1.Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new http_1.RequestOptions({ headers: headers });
        }
    };
    return RoomAuthService;
}());
RoomAuthService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, app_config_1.AppConfig])
], RoomAuthService);
exports.RoomAuthService = RoomAuthService;
//# sourceMappingURL=roomAuth.service.js.map