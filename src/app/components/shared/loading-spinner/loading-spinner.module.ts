/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { LoadingSpinnerComponent } from './loading-spinner.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    LoadingSpinnerComponent
  ],
  exports: [
    LoadingSpinnerComponent
  ]
})
export class LoadingSpinnerComponentModule {}
