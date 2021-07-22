/* Module imports */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '../../shared/interfaces';


@Component({
  selector: 'hops-schedule',
  templateUrl: './hops-schedule.component.html',
  styleUrls: ['./hops-schedule.component.scss'],
})
export class HopsScheduleComponent implements OnChanges {
  @Input() onRecipeAction: (actionName: string, options?: any[]) => void;
  @Input() refreshPipes: boolean;
  @Input() variant: RecipeVariant;
  hopsSchedule: HopsSchedule[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.variant && changes.variant.currentValue.hops) {
      this.hopsSchedule = changes.variant.currentValue.hops;
    }
  }

  /**
   * Open ingredient form modal to update a hops instance
   *
   * @params: hops - the hops instance to update
   *
   * @return: none
   */
  openIngredientFormModal(hops: HopsSchedule): void {
    this.onRecipeAction('openIngredientFormModal', ['hops', hops]);
  }

}
