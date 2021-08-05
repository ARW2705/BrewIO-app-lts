/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { CalendarDate } from '../../shared/interfaces';


@Component({
  selector: 'app-calendar-interactive-display',
  templateUrl: './calendar-interactive-display.component.html',
  styleUrls: ['./calendar-interactive-display.component.scss'],
})
export class CalendarInteractiveDisplayComponent {
  @Input() month: CalendarDate[][];
  @Output() dateButtonEvent: EventEmitter<CalendarDate> = new EventEmitter<CalendarDate>();
  weekdays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  /**
   * Emit date button event on click
   *
   * @param: day - the button's calendar date object
   *
   * @return: none
   */
  onDateButtonClick(day: CalendarDate): void {
    this.dateButtonEvent.emit(day);
  }

}
