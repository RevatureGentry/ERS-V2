import {Component, OnInit} from '@angular/core';
import * as fromAuth from '../../../user/state/user.reducer';
import {UserInfoState} from '../../../user/state/user.reducer';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {childRouteAnimations, dramaticEntrance} from '../../../app.animations';
import {CookieService} from 'ngx-cookie-service';
import {Router, RouterOutlet} from '@angular/router';
import {ClearUserDetailsAction} from '../../../user/state/user.actions';

@Component({
  selector: 'app-home-container',
  templateUrl: './home-container.component.html',
  styleUrls: ['./home-container.component.css'],
  animations: [dramaticEntrance, childRouteAnimations]
})
export class HomeContainerComponent implements OnInit {

  currentUser$: Observable<UserInfoState>;

  constructor(
    private store: Store<fromAuth.UserInfoState>,
    private cookieService: CookieService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.currentUser$ = this.store.pipe(select(fromAuth.currentUserInfoState));
  }

  handleLogout() {
    this.router.navigateByUrl('/login');
    this.cookieService.delete('api_token');
    this.store.dispatch(new ClearUserDetailsAction());
  }

  prepareChildRouteAnimation(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
