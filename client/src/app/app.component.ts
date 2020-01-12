import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {routeAnimations} from "./app.animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'client';

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData["animation"];
  }
}
