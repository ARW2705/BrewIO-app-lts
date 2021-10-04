/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-calendar-controls-toggle-button',
  templateUrl: './calendar-controls-toggle-button.component.html',
  styleUrls: ['./calendar-controls-toggle-button.component.scss'],
})
export class CalendarControlsToggleButtonComponent {
  @Input() buttonColor: string = '';
  @Input() buttonText: string = '';
  @Output() toggleButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit toggle button event on click
   *
   * @param: none
   * @return: none
   */
  onToggleClick(): void {
    this.toggleButtonEvent.emit();
  }

}
