import { Component, OnInit } from '@angular/core';

import { User } from '../_models/user/index';
import { Classroom } from '../_models/classroom/index';
import { ClassroomService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})

export class HomeComponent implements OnInit {
    currentUser: User;
    classrooms: Classroom[] = [];

    constructor( private classroomService: ClassroomService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.loadAllClassrooms();
    }

    deleteClassroom(_id: string) {
        this.classroomService.delete(_id).subscribe(() => { this.loadAllClassrooms() });
    }

    private loadAllClassrooms() {
        this.classroomService.getAll().subscribe(classrooms => { this.classrooms = classrooms; });
    }
}