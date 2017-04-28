import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { User } from '../_models/index';
 
import { AppConfig } from '../app.config';

@Injectable()
export class RoomAuthService {
    currentUser: User;

    constructor(private http: Http, private config: AppConfig) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
     }

    enterRoom(_id: string){
        return this.http.post(this.config.apiUrl + '/classrooms/authenticate', { _id : _id }, this.jwt())
            .map((response: Response) => {
               
                // login successful if there's a jwt token in the response
                let room = response.json();

                if (room) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentRoom', JSON.stringify(room));
                }
            });
    }

    exitRoom(){
        localStorage.removeItem('currentRoom');
    }

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }
}