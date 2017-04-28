import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { AppConfig } from '../app.config';
import { Classroom, User } from '../_models/index';


@Injectable()
export class ClassroomService {
    constructor(private http: Http, private config: AppConfig) { }

    getAll() {
        return this.http.get(this.config.apiUrl + '/classrooms',this.jwt()).map((response: Response) => response.json());
    }

    getById(_id: string) {
        return this.http.get(this.config.apiUrl + '/classrooms/' + _id,this.jwt()).map((response: Response) => response.json());
    }

    create(classroom: Classroom) {
        return this.http.post(this.config.apiUrl + '/classrooms/create', classroom,this.jwt());
    }
/*
    update(classroom: Classroom) {
        return this.http.put(this.config.apiUrl + '/classrooms/' + classroom._id, classroom,this.jwt());
    }
*/
    delete(_id: string) {
        return this.http.delete(this.config.apiUrl + '/classrooms/' + _id,this.jwt());
    }

    //Specific Methods
    getByTeacherId(teacherId:string){
        return this.http.get(this.config.apiUrl + '/classrooms/' + teacherId,this.jwt()).map((response: Response) => response.json());
    }

    getByStudentId(studentId:string){
        return this.http.get(this.config.apiUrl + '/classrooms/' + studentId,this.jwt()).map((response: Response) => response.json());
    }

    sendReq(roomName:string, student: User){
        return this.http.put(this.config.apiUrl + '/classrooms/' + roomName, student,this.jwt());
    }

    getReq(classroomid: string){
        return this.http.get(this.config.apiUrl + '/classrooms/pendingReq/' + classroomid,this.jwt()).map((response: Response) => response.json());
    }
    // private helper methods
    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
}