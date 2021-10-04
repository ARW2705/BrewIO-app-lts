/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { Batch } from '../../../../shared/interfaces';


@Component({
  selector: 'app-active-batch',
  templateUrl: './active-batch.component.html',
  styleUrls: ['./active-batch.component.scss'],
})
export class ActiveBatchComponent {
  @Input() batch: Batch;
  @Output() continueButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit continueButtonEvent with no value
   *
   * @param: none
   * @return: none
   */
  onContinueClick(): void {
    this.continueButtonEvent.emit();
  }

}
