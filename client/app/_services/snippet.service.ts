import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { Snippet } from '../_models/index';
import { AppConfig } from '../app.config';


@Injectable()
export class SnippetService {
    constructor(private http: Http, private config: AppConfig) { }

    getAll() {
        return this.http.get(this.config.apiUrl + '/snippets',this.jwt()).map((response: Response) => response.json());
    }

    getById(_id: string) {
        return this.http.get(this.config.apiUrl + '/snippets/' + _id,this.jwt()).map((response: Response) => response.json());
    }
    
    getByName(name: string) {
        return this.http.get(this.config.apiUrl + '/snippets/name/' + name,this.jwt()).map((response: Response) => response.json());
    }
    
    create(snippet: Snippet) {
        return this.http.post(this.config.apiUrl + '/snippets/create', snippet,this.jwt());
    }

    update(snippet: Snippet) {
        return this.http.put(this.config.apiUrl + '/snippets/' + snippet._id, snippet,this.jwt());
    }

    delete(_id: string) {
        return this.http.delete(this.config.apiUrl + '/snippets/' + _id,this.jwt());
    }

    getSnippetsForTeachId(_id:string){
        return this.http.get(this.config.apiUrl + '/snippets/getSnippets/' + _id,this.jwt()).map((response: Response) => response.json());  
    }

    updateSnippet(snippet: Snippet) {
        return this.http.put(this.config.apiUrl + '/snippets/updateSnippet/' + snippet._id, snippet,this.jwt());
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