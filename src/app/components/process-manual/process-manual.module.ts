/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessDescriptionComponentModule } from '../process-description/process-description.module';
import { ProcessHeaderComponentModule } from '../process-header/process-header.module';
import { ProcessPreviewContentComponentModule } from '../process-preview-content/process-preview-content.module';
import { ProcessManualComponent } from './process-manual.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProcessDescriptionComponentModule,
    ProcessHeaderComponentModule,
    ProcessPreviewContentComponentModule
  ],
  declarations: [
    ProcessManualComponent
  ],
  exports: [
    ProcessManualComponent
  ]
})
export class ProcessManualComponentModule {}
