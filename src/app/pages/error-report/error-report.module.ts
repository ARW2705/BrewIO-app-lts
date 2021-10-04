/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ErrorReportPage } from './error-report.page';

/* Component imports */
import { AccordionComponentModule, HeaderComponentModule } from '../../components/shared/public';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AccordionComponentModule,
    HeaderComponentModule,
    IonicModule
  ],
  declarations: [
    ErrorReportPage
  ],
  exports: [
    ErrorReportPage
  ]
})
export class ErrorReportPageModule {}
