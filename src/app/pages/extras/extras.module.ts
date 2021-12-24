/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

/* Page imports */
import { ExtrasPage } from './extras.page';

/* Component imports */
import { ActiveBatchListComponentModule } from '@components/batch/public';
import { InventoryComponentModule } from '@components/inventory/public';
import { AboutComponentModule, HeaderComponentModule, PreferencesComponentModule } from '@components/shared/public';
import { LoginSignupButtonComponentModule, UserComponentModule } from '@components/user/public';


@NgModule({
  imports: [
    AboutComponentModule,
    ActiveBatchListComponentModule,
    CommonModule,
    HeaderComponentModule,
    InventoryComponentModule,
    IonicModule,
    LoginSignupButtonComponentModule,
    PreferencesComponentModule,
    RouterModule.forChild([{path: '', component: ExtrasPage}]),
    UserComponentModule
  ],
  declarations: [
    ExtrasPage
  ]
})
export class ExtrasPageModule {}
