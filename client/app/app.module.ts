import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { AppConfig } from './app.config';

import { AlertComponent } from './_directives/index';
import { AuthGuard, RoomGuard } from './_guards/index';
import { AlertService, AuthenticationService, RoomAuthService, UserService, ClassroomService, SnippetService } from './_services/index';
import { HomeComponent } from './home/index';
import { LoginComponent } from './login/index';
import { RegisterComponent } from './register/index';
import { RoomComponent } from './room/index';
import { SnippetComponent } from './snippetComp/index';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        LoginComponent,
        RegisterComponent,
        RoomComponent,
        SnippetComponent
    ],
    providers: [
        AppConfig,
        AuthGuard,
        RoomGuard,
        AlertService,
        AuthenticationService,
        RoomAuthService,
        UserService,
        ClassroomService,
        SnippetService
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }