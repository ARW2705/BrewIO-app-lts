/* Module imports */
import { Component, Input, ViewChild } from '@angular/core';
import { IonReorderGroup } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';

/* Interface imports */
import { Process } from '../../shared/interfaces/process';

@Component({
  selector: 'process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss'],
})
export class ProcessListComponent {
  @Input() onRecipeAction: (actionName: string, options: any[]) => void;
  @Input() schedule: Process[];
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  processIcons: object = {
    manual: 'hand-right-outline',
    timer: 'timer-outline',
    calendar: 'calendar-outline'
  };

  constructor() { }

  /**
   * Open modal to create, edit, or delete specified process step type
   *
   * @params: processType - the step type, either 'manual', 'timer', or 'calendar'
   * @params: toUpdate - current step data to be edited or deleted
   * @params: index - index of step
   *
   * @return: none
   */
  openProcessModal(
    processType: string,
    toUpdate: Process,
    index: number
  ): void {
    this.onRecipeAction('openProcessModal', [processType, toUpdate, index]);
  }

  /**
   * Ion reorder group handler - set process schedule order to match event
   *
   * @params: event - the ionic reorder event
   *
   * @return: none
   */
  onReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    this.onRecipeAction('onReorder', [ event.detail.complete(this.schedule) ]);
  }

}
