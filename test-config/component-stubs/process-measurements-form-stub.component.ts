/* Module imports */
import { Component } from '@angular/core';

/* Page imports */
import { ProcessMeasurementsFormComponent } from '../../src/app/components/process/public/process-measurements-form/process-measurements-form.component';

@Component({
  selector: 'app-process-measurements-form',
  template: '',
  providers: [
    { provide: ProcessMeasurementsFormComponent, useClass: ProcessMeasurementsFormComponentStub }
  ]
})
export class ProcessMeasurementsFormComponentStub {}
