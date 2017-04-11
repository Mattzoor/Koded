import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { AppConfig } from '../app.config';
import { Classroom } from '../_models/classroom/index';

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
        return this.http.post(this.config.apiUrl + '/classroom/create', classroom,this.jwt());
    }

    update(classroom: Classroom) {
        return this.http.put(this.config.apiUrl + '/classrooms/' + classroom._id, classroom,this.jwt());
    }

    delete(_id: string) {
        return this.http.delete(this.config.apiUrl + '/classroom/' + _id,this.jwt());
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