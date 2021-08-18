/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-timer-button',
  templateUrl: './timer-button.component.html',
  styleUrls: ['./timer-button.component.scss'],
})
export class TimerButtonComponent {
  @Input() buttonText: string;
  @Input() buttonColor: string;
  @Output() timerClickEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit timer button click event
   *
   * @param: none
   * @return: none
   */
  onClick(): void {
    this.timerClickEvent.emit();
  }

}
