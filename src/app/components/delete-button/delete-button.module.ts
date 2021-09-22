/* Module imports */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

/* Component imports */
import { DeleteButtonComponent } from './delete-button.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [ DeleteButtonComponent ],
  exports: [ DeleteButtonComponent ]
})
export class DeleteButtonComponentModule {}
