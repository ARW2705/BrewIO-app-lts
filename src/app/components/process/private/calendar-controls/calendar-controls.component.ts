/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-controls',
  templateUrl: './calendar-controls.component.html',
  styleUrls: ['./calendar-controls.component.scss'],
})
export class CalendarControlsComponent {
  @Input() displayDate: moment.Moment;
  @Input() editType: string;
  @Output() changeButtonEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() selectButtonEvent: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Emit change month click event
   *
   * @param: isForward - true to advance month; false to go back
   * @return: none
   */
  onChangeClick(isForward: boolean): void {
    this.changeButtonEvent.emit(isForward);
  }

  /**
   * Emit select click event
   *
   * @param: selectType - either 'start' or 'alerts'
   *
   * @return: none
   */
  onSelectClick(selectType: string): void {
    this.selectButtonEvent.emit(selectType);
  }

}
