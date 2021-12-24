/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ProcessCalendarComponentModule, ProcessControlsComponentModule, ProcessManualComponentModule, ProcessTimerComponentModule } from '@components/process/public';
import { HeaderComponentModule } from '@components/shared/public';
import { ErrorReportComponentModule } from '@components/system/public/error-report/error-report.module';

import { ProcessPage } from './process.page';


@NgModule({
  imports: [
    CommonModule,
    ErrorReportComponentModule,
    HeaderComponentModule,
    IonicModule,
    ProcessCalendarComponentModule,
    ProcessControlsComponentModule,
    ProcessManualComponentModule,
    ProcessTimerComponentModule,
    RouterModule.forChild([ { path: '', component: ProcessPage } ])
  ],
  declarations: [
    ProcessPage
  ]
})
export class ProcessPageModule {}
