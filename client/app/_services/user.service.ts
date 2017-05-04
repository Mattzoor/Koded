import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { AppConfig } from '../app.config';
import { User, Classroom } from '../_models/index';

@Injectable()
export class UserService {
    constructor(private http: Http, private config: AppConfig) { }

    getAll() {
        return this.http.get(this.config.apiUrl + '/users', this.jwt()).map((response: Response) => response.json());
    }

    getById(_id: string) {
        return this.http.get(this.config.apiUrl + '/users/' + _id, this.jwt()).map((response: Response) => response.json());
    }

    getClassrooms(_id:string){
        console.log("asd");
        return this.http.get(this.config.apiUrl + '/users/rooms/' + _id,this.jwt()).map((response: Response) => response.json());
    }

    create(user: User) {
        return this.http.post(this.config.apiUrl + '/users/register', user, this.jwt());
    }

    update(user: User) {
        return this.http.put(this.config.apiUrl + '/users/' + user._id, user, this.jwt());
    }

    delete(_id: string) {
        return this.http.delete(this.config.apiUrl + '/users/' + _id, this.jwt());
    }

    exitClassroom(userId: string, room: Classroom){
        //console.log(userId + "    " + room);
        return this.http.put(this.config.apiUrl + '/users/exit/' + userId, room, this.jwt());
    }

    updateRooms(student: User, classroom:Classroom){
        return this.http.put(this.config.apiUrl + '/users/updateRoom/' + classroom._id, student, this.jwt());
    }
    removeRooms(student: User, classroom:Classroom){
        return this.http.put(this.config.apiUrl + '/users/removePendReq/' + classroom._id, student, this.jwt());
    }
    removeStud(student: User, classroom:Classroom){
        return this.http.put(this.config.apiUrl + '/users/removeRoom/' + classroom._id, student, this.jwt());
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