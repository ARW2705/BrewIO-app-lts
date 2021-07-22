/* Module imports */
import { Component, Input, OnChanges, ViewChild } from '@angular/core';

/* Interface imports */
import { Alert, CalendarProcess } from '../../shared/interfaces';

/* Component imports */
import { CalendarComponent } from '../calendar/calendar.component';

/* Service imports */
import { EventService, IdService } from '../../services/services';


@Component({
  selector: 'process-calendar',
  templateUrl: './process-calendar.component.html',
  styleUrls: ['./process-calendar.component.scss']
})
export class ProcessCalendarComponent implements OnChanges {
  @Input() alerts: Alert[];
  @Input() isPreview: boolean;
  @Input() stepData: CalendarProcess;
  @ViewChild('calendar') calendarRef: CalendarComponent;
  closestAlert: Alert = null;
  currentStepCalendarData: object = {};
  showDescription: boolean = false;

  constructor(
    public event: EventService,
    public idService: IdService
  ) { }

  ngOnChanges() {
    console.log('process calendar changes');
    this.currentStepCalendarData = {
      _id: this.idService.getId(this.stepData),
      duration: this.stepData.duration,
      title: this.stepData.name,
      description: this.stepData.description
    };
    this.closestAlert = this.getClosestAlertByGroup();
  }

  /**
   * Publish event to revert calendar to date selection view
   *
   * @params: none
   * @return: none
   */
  changeDate(): void {
    this.event.emit('change-date');
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
      return this.alerts.reduce(
        (acc: Alert, curr: Alert): Alert => {
          const now: number = new Date().getTime();
          const accDiff: number = new Date(acc.datetime).getTime() - now;
          const currDiff: number = new Date(curr.datetime).getTime() - now;

          const isCurrCloser: boolean
            = Math.abs(currDiff) < Math.abs(accDiff) && currDiff > 0;

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
   * @return: object containing update and step id
   */
  startCalendar(): object {
    const calendarValues: { _id: string, startDatetime: string, alerts: Alert[] }
      = this.calendarRef.getFinal();

    const update: object = {
      startDatetime: calendarValues.startDatetime,
      alerts: calendarValues.alerts
    };

    return {
      id: calendarValues._id,
      update: update
    };
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
