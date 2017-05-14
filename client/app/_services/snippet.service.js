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
var SnippetService = (function () {
    function SnippetService(http, config) {
        this.http = http;
        this.config = config;
    }
    SnippetService.prototype.getAll = function () {
        return this.http.get(this.config.apiUrl + '/snippets', this.jwt()).map(function (response) { return response.json(); });
    };
    SnippetService.prototype.getById = function (_id) {
        return this.http.get(this.config.apiUrl + '/snippets/' + _id, this.jwt()).map(function (response) { return response.json(); });
    };
    SnippetService.prototype.getByName = function (name) {
        return this.http.get(this.config.apiUrl + '/snippets/name/' + name, this.jwt()).map(function (response) { return response.json(); });
    };
    SnippetService.prototype.create = function (snippet) {
        return this.http.post(this.config.apiUrl + '/snippets/create', snippet, this.jwt());
    };
    SnippetService.prototype.update = function (snippet) {
        return this.http.put(this.config.apiUrl + '/snippets/' + snippet._id, snippet, this.jwt());
    };
    SnippetService.prototype.delete = function (_id) {
        return this.http.delete(this.config.apiUrl + '/snippets/' + _id, this.jwt());
    };
    SnippetService.prototype.getSnippetsForTeachId = function (_id) {
        return this.http.get(this.config.apiUrl + '/snippets/getSnippets/' + _id, this.jwt()).map(function (response) { return response.json(); });
    };
    SnippetService.prototype.updateSnippet = function (snippet) {
        return this.http.put(this.config.apiUrl + '/snippets/updateSnippet/' + snippet._id, snippet, this.jwt());
    };
    SnippetService.prototype.saveSnippet = function (snippet) {
        return this.http.put(this.config.apiUrl + '/snippets/saveSnippet/' + snippet._id, snippet, this.jwt());
    };
    // private helper methods
    SnippetService.prototype.jwt = function () {
        // create authorization header with jwt token
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            var headers = new http_1.Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new http_1.RequestOptions({ headers: headers });
        }
    };
    return SnippetService;
}());
SnippetService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, app_config_1.AppConfig])
], SnippetService);
exports.SnippetService = SnippetService;
//# sourceMappingURL=snippet.service.js.map