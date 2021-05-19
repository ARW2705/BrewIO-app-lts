/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { AboutComponent } from '../../src/app/components/about/about.component';

@Component({
  selector: 'about',
  template: '',
  providers: [
    { provide: AboutComponent, useClass: AboutComponentStub }
  ]
})
export class AboutComponentStub {}
