/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';

/* Interface imports */
import { Alert, CalendarMetadata, CalendarProcess } from '../../shared/interfaces';

/* Component imports */
import { CalendarComponent } from '../calendar/calendar.component';

/* Service imports */
import { IdService } from '../../services/services';


@Component({
  selector: 'app-process-calendar',
  templateUrl: './process-calendar.component.html',
  styleUrls: ['./process-calendar.component.scss']
})
export class ProcessCalendarComponent implements OnChanges {
  @Input() alerts: Alert[];
  @Input() isPreview: boolean;
  @Input() calendarProcess: CalendarProcess;
  @Output() changeDateEvent: EventEmitter<null> = new EventEmitter<null>();
  @ViewChild('calendar') calendarRef: CalendarComponent;
  closestAlert: Alert = null;
  showDescription: boolean = false;

  constructor(public idService: IdService) { }

  ngOnChanges() {
    console.log('process calendar changes');
    this.closestAlert = this.getClosestAlertByGroup();
  }

  /**
   * Emit event to revert calendar to date selection view
   *
   * @params: none
   * @return: none
   */
  changeDate(): void {
    this.changeDateEvent.emit();
  }

  /**
   * Get alert for a particular step that is closest to the present datetime
   *
   * @params: none
   *
   * @return: alert that is closest to the current datetime
   */
  getClosestAlertByGroup(): Alert {
    if (this.alerts.length) {
      const now: number = new Date().getTime();
      return this.alerts.reduce(
        (acc: Alert, curr: Alert): Alert => {
          const accDiff: number = new Date(acc.datetime).getTime() - now;
          const currDiff: number = new Date(curr.datetime).getTime() - now;
          const isCurrCloser: boolean = Math.abs(currDiff) < Math.abs(accDiff) && currDiff > 0;
          return isCurrCloser ? curr : acc;
        }
      );
    }

    return null;
  }

  /**
   * Set the start of a calendar step and update server
   *
   * @params: none
   *
   * @return: calendar metadata
   */
  startCalendar(): CalendarMetadata {
    return this.calendarRef.getFinal();
  }

  /**
   * Show or hide the current step description
   *
   * @params: none
   * @return: none
   */
  toggleShowDescription(): void {
    this.showDescription = !this.showDescription;
  }

}
