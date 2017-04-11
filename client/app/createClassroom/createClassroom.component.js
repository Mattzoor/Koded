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
var CreateClassroomComponent = (function () {
    function CreateClassroomComponent(router, classroomService, alertService) {
        this.router = router;
        this.classroomService = classroomService;
        this.alertService = alertService;
        this.model = {};
        this.loading = false;
    }
    CreateClassroomComponent.prototype.createClassroom = function () {
        var _this = this;
        this.loading = true;
        this.classroomService.create(this.model)
            .subscribe(function (data) {
            _this.alertService.success('Classroom created successful', true);
            _this.router.navigate(['/']);
        }, function (error) {
            _this.alertService.error(error._body);
            _this.loading = false;
        });
    };
    return CreateClassroomComponent;
}());
CreateClassroomComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        templateUrl: 'createClassroom.component.html'
    }),
    __metadata("design:paramtypes", [router_1.Router,
        index_1.ClassroomService,
        index_1.AlertService])
], CreateClassroomComponent);
exports.CreateClassroomComponent = CreateClassroomComponent;
//# sourceMappingURL=createClassroom.component.js.map