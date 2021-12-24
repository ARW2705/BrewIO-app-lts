/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessFormComponentModule } from '@components/process/private/process-form/process-form.module';
import { ProcessListComponentModule } from '@components/process/private/process-list/process-list.module';
import { ProcessContainerComponent } from './process-container.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProcessListComponentModule,
    ProcessFormComponentModule
  ],
  declarations: [
    ProcessContainerComponent
  ],
  exports: [
    ProcessContainerComponent
  ]
})
export class ProcessContainerComponentModule {}
