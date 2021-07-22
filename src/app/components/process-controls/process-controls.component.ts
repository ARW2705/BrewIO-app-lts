/* Module imports */
import { Component, Input } from '@angular/core';


@Component({
  selector: 'process-controls',
  templateUrl: './process-controls.component.html',
  styleUrls: ['./process-controls.component.scss'],
})
export class ProcessControlsComponent {
  @Input() atViewEnd: boolean = false;
  @Input() atViewStart: boolean = false;
  @Input() isCalendarInProgress: boolean = false;
  @Input() isCalendarStep: boolean = false;
  @Input() onControlAction: (actionName: string, ...options: any[]) => void;
  @Input() onCurrentStep: boolean = false;

  constructor() { }

  /**
   * Change the step view
   *
   * @params: direction - the direction to go; either 'next' or 'prev'
   *
   * @return: none
   */
  changeStep(direction: string): void {
    this.onControlAction('changeStep', direction);
  }

  /**
   * Complete the current step
   *
   * @params: none
   * @return: none
   */
  completeStep(): void {
    this.onControlAction('completeStep');
  }

  /**
   * Change view to the current step
   *
   * @params: none
   * @return: none
   */
  goToActiveStep(): void {
    this.onControlAction('goToActiveStep');
  }

  /**
   * Open the measurement form modal (submission will not be required)
   *
   * @params: none
   * @return: none
   */
  openMeasurementFormModal(): void {
    this.onControlAction('openMeasurementFormModal', false);
  }

  /**
   * Start the calendar step with selected dates
   *
   * @params: none
   * @return: none
   */
  startCalendar(): void {
    this.onControlAction('startCalendar');
  }

}
