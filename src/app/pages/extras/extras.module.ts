/* Module imports */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponentModule } from '../../components/header/header.module';
import { AboutComponentModule } from '../../components/about/about.module';
import { ActiveBatchesComponentModule } from '../../components/active-batches/active-batches.module';
import { InventoryComponentModule } from '../../components/inventory/inventory.module';
import { PreferencesComponentModule } from '../../components/preferences/preferences.module';
import { UserComponentModule } from '../../components/user/user.module';

/* Page imports */
import { ExtrasPage } from './extras.page';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponentModule,
    AboutComponentModule,
    ActiveBatchesComponentModule,
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
