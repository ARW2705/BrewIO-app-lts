/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessDescriptionComponentModule } from '../process-description/process-description.module';
import { ProcessPreviewContentComponent } from './process-preview-content.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProcessDescriptionComponentModule
  ],
  declarations: [
    ProcessPreviewContentComponent
  ],
  exports: [
    ProcessPreviewContentComponent
  ]
})
export class ProcessPreviewContentComponentModule {}
