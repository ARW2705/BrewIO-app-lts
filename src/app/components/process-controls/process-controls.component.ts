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
  @Output() changeStepEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() completeStepEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() goToActiveStepEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() openMeasurementFormModalEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() startCalendarEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Change the step view
   *
   * @params: direction - the direction to go; either 'next' or 'prev'
   *
   * @return: none
   */
  changeStep(direction: string): void {
    this.changeStepEvent.emit(direction);
  }

  /**
   * Complete the current step
   *
   * @params: none
   * @return: none
   */
  completeStep(): void {
    this.completeStepEvent.emit();
  }

  /**
   * Change view to the current step
   *
   * @params: none
   * @return: none
   */
  goToActiveStep(): void {
    this.goToActiveStepEvent.emit();
  }

  /**
   * Open the measurement form modal (submission will not be required)
   *
   * @params: none
   * @return: none
   */
  openMeasurementFormModal(): void {
    this.openMeasurementFormModalEvent.emit(false);
  }

  /**
   * Start the calendar step with selected dates
   *
   * @params: none
   * @return: none
   */
  startCalendar(): void {
    this.startCalendarEvent.emit();
  }

}
