/* Module imports */
import { Component } from '@angular/core';

/* Component imports */
import { PreferencesComponent } from '../../src/app/components/preferences/preferences.component';

@Component({
  selector: 'preferences',
  template: '',
  providers: [
    { provide: PreferencesComponent, useClass: PreferencesComponentStub }
  ]
})
export class PreferencesComponentStub {}
