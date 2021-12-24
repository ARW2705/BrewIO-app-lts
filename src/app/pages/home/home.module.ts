/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { ActiveBatchListComponentModule } from '@components/batch/public';
import { InventoryComponentModule } from '@components/inventory/public';
import { AccordionComponentModule, HeaderComponentModule } from '@components/shared/public';
import { LoginFormComponentModule } from '@components/user/public/login-form/login-form.module';
import { SignupFormComponentModule } from '@components/user/public/signup-form/signup-form.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    AccordionComponentModule,
    ActiveBatchListComponentModule,
    CommonModule,
    HeaderComponentModule,
    InventoryComponentModule,
    IonicModule,
    LoginFormComponentModule,
    RouterModule.forChild([ { path: '', component: HomePage } ]),
    SignupFormComponentModule
  ],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
