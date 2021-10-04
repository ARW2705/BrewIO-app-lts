/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { LoginPageModule } from '../forms/login/login.module';
import { SignupPageModule } from '../forms/signup/signup.module';
import { ExtrasPage } from './extras.page';

/* Component imports */
import { ActiveBatchListComponentModule } from '../../components/batch/public';
import { InventoryComponentModule } from '../../components/inventory/public';
import { AboutComponentModule, HeaderComponentModule, PreferencesComponentModule } from '../../components/shared/public';
import { UserComponentModule } from '../../components/user/public';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LoginPageModule,
    SignupPageModule,
    HeaderComponentModule,
    AboutComponentModule,
    ActiveBatchListComponentModule,
    InventoryComponentModule,
    PreferencesComponentModule,
    UserComponentModule,
    RouterModule.forChild([{path: '', component: ExtrasPage}])
  ],
  declarations: [
    ExtrasPage
  ]
})
export class ExtrasPageModule {}
