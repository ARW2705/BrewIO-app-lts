/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { AboutComponent } from '../../src/app/components/shared/about/about.component';

@Component({
  selector: 'app-about',
  template: '',
  providers: [
    { provide: AboutComponent, useClass: AboutComponentStub }
  ]
})
export class AboutComponentStub {}
