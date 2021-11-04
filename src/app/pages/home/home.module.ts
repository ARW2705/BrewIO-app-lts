/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ActiveBatchListComponentModule } from '../../components/batch/public';
import { InventoryComponentModule } from '../../components/inventory/public';
import { AccordionComponentModule, HeaderComponentModule } from '../../components/shared/public';

/* Page imports */
import { ErrorReportPageModule } from '../error-report/error-report.module';
import { LoginPageModule } from '../forms/login/login.module';
import { SignupPageModule } from '../forms/signup/signup.module';
import { HomePage } from './home.page';


@NgModule({
  imports: [
    CommonModule,
    ErrorReportPageModule,
    LoginPageModule,
    SignupPageModule,
    IonicModule,
    RouterModule.forChild([ { path: '', component: HomePage } ]),
    AccordionComponentModule,
    ActiveBatchListComponentModule,
    InventoryComponentModule,
    HeaderComponentModule
  ],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
