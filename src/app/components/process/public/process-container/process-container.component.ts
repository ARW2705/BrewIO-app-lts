/* Module imports */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/* Interface imports */
import { CalendarProcess, ManualProcess, Process, ProcessUpdate, ProcessUpdateEvent, RecipeVariant, TimerProcess } from '../../../../shared/interfaces';

/* Page imports */
// import { ProcessFormPage } from '../../../../pages/forms/process-form/process-form.page';
import { ProcessFormComponent } from '../../private/process-form/process-form.component';

/* Service imports */
import { ActionSheetService, ErrorReportingService, ModalService } from '../../../../services/services';


@Component({
  selector: 'app-process-container',
  templateUrl: './process-container.component.html',
  styleUrls: ['./process-container.component.scss'],
})
export class ProcessContainerComponent implements OnInit {
  @Input() isAddButtonDisabled: boolean;
  @Input() variant: RecipeVariant;
  @Output() processUpdateEvent: EventEmitter<ProcessUpdateEvent> = new EventEmitter<ProcessUpdateEvent>();
  @Output() reorderEvent: EventEmitter<Process[]> = new EventEmitter<Process[]>();

  constructor(
    public actionService: ActionSheetService,
    public errorReporter: ErrorReportingService,
    public modalService: ModalService
  ) { }

  ngOnInit() {}

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
          handler: (): void => { this.openProcessModal('manual'); }
        },
        {
          text: 'Timer',
          handler: (): void => { this.openProcessModal('timer'); }
        },
        {
          text: 'Calendar',
          handler: (): void => { this.openProcessModal('calendar'); }
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
      processType: toUpdate ? toUpdate['type'] : type,
      update: toUpdate,
      formType: toUpdate ? 'update' : 'create'
    };
  }

  /**
   * Handle process form modal error
   *
   * @params: none
   *
   * @return: error handler function
   */
  // onProcessFormModalError(): (error: string) => void {
  //   return (error: string): void => {
  //     console.log('Process form modal error', error);
  //     this.toastService.presentErrorToast('A process form error occurred');
  //   };
  // }

  /**
   * Handle process form modal returned data
   *
   * @params: [index] - the index to update/delete or to add if undefined
   *
   * @return: success handler function
   */
  // onProcessFormModalSuccess(index?: number): (data: object) => void {
  //   return (data: object): void => {
  //     const _data: object = data['data'];
  //
  //     if (_data) {
  //       if (_data['delete']) {
  //         this.variant.processSchedule.splice(index, 1);
  //       } else if (_data['update']) {
  //         _data['update']['cid'] = this.variant.processSchedule[index].cid;
  //         this.variant.processSchedule[index] = <Process>_data['update'];
  //       } else {
  //         _data['cid'] = this.idService.getNewId();
  //         this.variant.processSchedule.push(<Process>_data);
  //       }
  //     }
  //   };
  // }

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
      // ProcessFormPage,
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

    // const modal: HTMLIonModalElement = await this.modalCtrl.create({
    //   component: ProcessFormPage,
    //   componentProps: this.getProcessFormModalOptions(type, toUpdate)
    // });
    //
    // from(modal.onDidDismiss())
    //   .subscribe(
    //     this.onProcessFormModalSuccess(index),
    //     this.onProcessFormModalError()
    //   );
    //
    // return await modal.present();
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
