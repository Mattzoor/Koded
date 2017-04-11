import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService, ClassroomService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'createClassroom.component.html'
})

export class CreateClassroomComponent {
    model: any = {};
    loading = false;

    constructor(
        private router: Router,
        private classroomService: ClassroomService,
        private alertService: AlertService) { }

    createClassroom() {
        this.loading = true;
        this.classroomService.create(this.model)
            .subscribe(
                data => {
                    this.alertService.success('Classroom created successful', true);
                    this.router.navigate(['/']);
                },
                error => {
                    this.alertService.error(error._body);
                    this.loading = false;
                });
    }
}
