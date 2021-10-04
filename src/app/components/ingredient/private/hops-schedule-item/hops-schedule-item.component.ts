/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Interface imports */
import { HopsSchedule } from '../../../../shared/interfaces';


@Component({
  selector: 'app-hops-schedule-item',
  templateUrl: './hops-schedule-item.component.html',
  styleUrls: ['./hops-schedule-item.component.scss'],
})
export class HopsScheduleItemComponent {
  @Input() hops: HopsSchedule;
  @Input() ibu: string;
  @Input() isLast: boolean;
  @Output() openIngredientFormButtonEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Open ingredient form modal to update a grains instance
   *
   * @params: none
   * @return: none
   */
  openIngredientFormModal(): void {
    this.openIngredientFormButtonEvent.emit();
  }

}
