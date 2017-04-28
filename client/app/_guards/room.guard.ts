import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class RoomGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('currentRoom')) {
            // logged in so return true
            return true;
        }
        
        if(localStorage.getItem('currentUser')){
            this.router.navigate(['/'], { queryParams: { returnUrl: state.url }});
            return false;
        }else {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            return false;
        }
    }
}