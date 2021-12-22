/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { CalendarProcess, ManualProcess, Process, ProcessUpdateEvent, RecipeVariant, TimerProcess } from '../../../../shared/interfaces';

/* Component imports */
import { ProcessFormComponent } from '../../private/process-form/process-form.component';

/* Service imports */
import { ActionSheetService, ErrorReportingService, ModalService } from '../../../../services/services';


@Component({
  selector: 'app-process-container',
  templateUrl: './process-container.component.html',
  styleUrls: ['./process-container.component.scss'],
})
export class ProcessContainerComponent {
  @Input() isAddButtonDisabled: boolean;
  @Input() variant: RecipeVariant;
  @Output() processUpdateEvent: EventEmitter<ProcessUpdateEvent> = new EventEmitter<ProcessUpdateEvent>();
  @Output() reorderEvent: EventEmitter<Process[]> = new EventEmitter<Process[]>();

  constructor(
    public actionService: ActionSheetService,
    public errorReporter: ErrorReportingService,
    public modalService: ModalService
  ) { }

  /**
   * Open action sheet to select the type of process step to add
   *
   * @params: none
   * @return: none
   */
  openProcessActionSheet(): void {
    this.actionService.openActionSheet(
      'Add a process step',
      [
        {
          text: 'Manual',
          handler: (): void => this.openProcessModal('manual')
        },
        {
          text: 'Timer',
          handler: (): void => this.openProcessModal('timer')
        },
        {
          text: 'Calendar',
          handler: (): void => this.openProcessModal('calendar')
        }
      ]
    );
  }

  /**
   * Configure process form modal options
   *
   * @params: type - the process type ('manual', 'timer', or 'calendar')
   * @params: [toUpdate] - optional current process data to edit or delete
   *
   * @return: configuration object
   */
  getProcessFormModalOptions(type: string, toUpdate?: Process): object {
    return {
      processType: toUpdate ? toUpdate.type : type,
      update: toUpdate,
      formType: toUpdate ? 'update' : 'create'
    };
  }

  /**
   * Open modal to create, edit, or delete specified process step type
   *
   * @params: type - the process type ('manual', 'timer', or 'calendar')
   * @params: [toUpdate] - optional current step data to be edited or deleted
   * @params: [index] - optional index of step
   *
   * @return: none
   */
  openProcessModal(type: string, toUpdate?: Process, index?: number): void {
    this.modalService.openModal<CalendarProcess | ManualProcess | TimerProcess | { delete: boolean }>(
      ProcessFormComponent,
      this.getProcessFormModalOptions(type, toUpdate)
    )
    .subscribe(
      (process: CalendarProcess | ManualProcess | TimerProcess | { delete: boolean }): void => {
        if (process) {
          this.processUpdateEvent.emit({ type, toUpdate, process, index });
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Helper function for event emitted from child component to unpack multiple params
   *
   * @param: eventParams - array of params to be applied to process modal in the order
   *   of types 'string', 'Process', then 'number'
   *
   * @return: none
   */
  openProcessModalHelper(eventParams: [string, Process, number]): void {
    this.openProcessModal(...eventParams);
  }

  /**
   * Ion reorder group handler - set process schedule order to match event
   *
   * @params: schedule - process schedule to apply to variant
   *
   * @return: none
   */
  onReorder(schedule: Process[]): void {
    this.reorderEvent.emit(schedule);
  }

}
