/* Module imports */
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonReorderGroup } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';

/* Interface imports */
import { Process } from '../../shared/interfaces';


@Component({
  selector: 'app-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss'],
})
export class ProcessListComponent {
  @Input() schedule: Process[];
  @Output() openProcessModalEvent: EventEmitter<[string, Process, number]> = new EventEmitter<[string, Process, number]>();
  @Output() reorderEvent: EventEmitter<Process[]> = new EventEmitter<Process[]>();
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  processIcons: object = {
    manual: 'hand-right-outline',
    timer: 'timer-outline',
    calendar: 'calendar-outline'
  };

  /**
   * Open modal to create, edit, or delete specified process step type
   *
   * @params: toUpdate - current step data to be edited or deleted
   * @params: index - index of step
   *
   * @return: none
   */
  openProcessModal(toUpdate: Process, index: number): void {
    this.openProcessModalEvent.emit([toUpdate.type, toUpdate, index]);
  }

  /**
   * Ion reorder group handler - set process schedule order to match event
   *
   * @params: event - the ionic reorder event
   *
   * @return: none
   */
  onReorder(event: CustomEvent<ItemReorderEventDetail>): void {
    this.reorderEvent.emit(event.detail.complete(this.schedule));
  }

}
