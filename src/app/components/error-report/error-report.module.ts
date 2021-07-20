/* Module imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ErrorReportComponent } from './error-report.component';
import { AccordionComponentModule } from '../../components/accordion/accordion.module';
import { HeaderComponentModule } from '../../components/header/header.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AccordionComponentModule,
    HeaderComponentModule,
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
