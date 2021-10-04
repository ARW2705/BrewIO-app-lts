/* Module imports */
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';

/* Interface imports */
import { Alert, CalendarMetadata, CalendarProcess } from '../../../../shared/interfaces';

/* Component imports */
import { CalendarComponent } from '../../private/calendar/calendar.component';

/* Service imports */
import { CalendarAlertService, IdService } from '../../../../services/services';


@Component({
  selector: 'app-process-calendar',
  templateUrl: './process-calendar.component.html',
  styleUrls: ['./process-calendar.component.scss']
})
export class ProcessCalendarComponent implements OnChanges {
  @Input() alerts: Alert[];
  @Input() calendarProcess: CalendarProcess;
  @Input() isPreview: boolean;
  @Output() changeDateEvent: EventEmitter<null> = new EventEmitter<null>();
  @ViewChild('calendar') calendarRef: CalendarComponent;
  closestAlert: Alert = null;
  showDescription: boolean = false;

  constructor(
    public calendarAlertService: CalendarAlertService,
    public idService: IdService
  ) { }

  ngOnChanges() {
    console.log('process calendar changes');
    this.closestAlert = this.calendarAlertService.getClosestAlertByGroup(this.alerts);
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
   * Get calendar metadata from child calendar component
   *
   * @param: none
   *
   * @return: calendar component data
   */
  getSelectedCalendarData(): CalendarMetadata {
    return this.calendarRef.getSelectedCalendarData();
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
