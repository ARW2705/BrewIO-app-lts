/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-process-controls',
  templateUrl: './process-controls.component.html',
  styleUrls: ['./process-controls.component.scss'],
})
export class ProcessControlsComponent {
  @Input() atViewEnd: boolean = false;
  @Input() atViewStart: boolean = false;
  @Input() isCalendarInProgress: boolean = false;
  @Input() isCalendarStep: boolean = false;
  @Input() onCurrentStep: boolean = false;
  @Output() changeStepEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() completeStepEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() goToActiveStepEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() openMeasurementFormModalEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() startCalendarEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Change the step view
   *
   * @param: isForward - true to advance forward; false to go back
   *
   * @return: none
   */
  changeStep(isForward: boolean): void {
    this.changeStepEvent.emit(isForward);
  }

  /**
   * Complete the current step
   *
   * @param: none
   * @return: none
   */
  completeStep(): void {
    this.completeStepEvent.emit();
  }

  /**
   * Change view to the current step
   *
   * @param: none
   * @return: none
   */
  goToActiveStep(): void {
    this.goToActiveStepEvent.emit();
  }

  /**
   * Open the measurement form modal (submission will not be required)
   *
   * @param: none
   * @return: none
   */
  openMeasurementFormModal(): void {
    this.openMeasurementFormModalEvent.emit(false);
  }

  /**
   * Start the calendar step with selected dates
   *
   * @param: none
   * @return: none
   */
  startCalendar(): void {
    this.startCalendarEvent.emit();
  }

}
