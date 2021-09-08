/* Module imports */
import { Component } from '@angular/core';

/* Constant imports */
import { API_VERSION, APP_VERSION } from '../../shared/constants';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  readonly apiVersion: string = API_VERSION.split('v')[1];
  readonly appDescription: string = 'BrewIO is a multi-purpose tool to design homebrews, organize production, and track inventory.';
  readonly appVersion: string = APP_VERSION;
  readonly githubURL: string = 'https://github.com/ARW2705/BrewIO-App';
}
