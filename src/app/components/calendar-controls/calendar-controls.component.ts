/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { CalendarDate } from '../../shared/interfaces';


@Component({
  selector: 'app-calendar-controls',
  templateUrl: './calendar-controls.component.html',
  styleUrls: ['./calendar-controls.component.scss'],
})
export class CalendarControlsComponent {
  @Input() displayDate: CalendarDate;
  @Input() editType: string;
  @Output() changeButtonEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() selectButtonEvent: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Emit change month click event
   *
   * @param: direction - either 'prev' or 'next'
   *
   * @return: none
   */
  onChangeClick(direction: string): void {
    this.changeButtonEvent.emit(direction);
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
