/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { Alert } from '../../shared/interfaces';


@Component({
  selector: 'app-process-calendar-alerts',
  templateUrl: './process-calendar-alerts.component.html',
  styleUrls: ['./process-calendar-alerts.component.scss'],
})
export class ProcessCalendarAlertsComponent {
  @Input() alerts: Alert[];
  @Input() closestAlert: Alert;
  @Input() description: string;
  @Output() changeDateEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Handle change date button click
   *
   * @param: none
   * @return: none
   */
  changeDate(): void {
    this.changeDateEvent.emit();
  }
}
