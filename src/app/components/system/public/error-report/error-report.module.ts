/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { AccordionComponentModule } from '../../../shared/accordion/accordion.module';

/* Page imports */
import { ErrorReportComponent } from './error-report.component';



@NgModule({
  imports: [
    AccordionComponentModule,
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [
    ErrorReportComponent
  ],
  exports: [
    ErrorReportComponent
  ]
})
export class ErrorReportComponentModule {}
