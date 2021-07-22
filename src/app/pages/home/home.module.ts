/* Module imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { AccordionComponentModule } from '../../components/accordion/accordion.module';
import { ActiveBatchesComponentModule } from '../../components/active-batches/active-batches.module';
import { HeaderComponentModule } from '../../components/header/header.module';
import { InventoryComponentModule } from '../../components/inventory/inventory.module';

/* Page imports */
import { ErrorReportPageModule } from '../error-report/error-report.module';
import { HomePage } from './home.page';
import { LoginPageModule } from '../forms/login/login.module';
import { SignupPageModule } from '../forms/signup/signup.module';


@NgModule({
  imports: [
    CommonModule,
    ErrorReportPageModule,
    LoginPageModule,
    SignupPageModule,
    IonicModule,
    RouterModule.forChild([ { path: '', component: HomePage } ]),
    AccordionComponentModule,
    ActiveBatchesComponentModule,
    InventoryComponentModule,
    HeaderComponentModule
  ],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
