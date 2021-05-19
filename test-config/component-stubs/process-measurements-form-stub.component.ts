/* Module imports */
import { Component } from '@angular/core';

/* Page imports */
import { ProcessMeasurementsFormPage } from '../../src/app/pages/forms/process-measurements-form/process-measurements-form.page';

@Component({
  selector: 'page-process-measurements-form',
  template: '',
  providers: [
    { provide: ProcessMeasurementsFormPage, useClass: ProcessMeasurementsFormPageStub }
  ]
})
export class ProcessMeasurementsFormPageStub {}
