/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-calendar-controls-change-button',
  templateUrl: './calendar-controls-change-button.component.html',
  styleUrls: ['./calendar-controls-change-button.component.scss'],
})
export class CalendarControlsChangeButtonComponent {
  @Input() iconName: string = '';
  @Output() changeButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit calendar month change event
   *
   * @param: none
   * @return: none
   */
  onChangeButtonClick(): void {
    this.changeButtonEvent.emit();
  }

}
