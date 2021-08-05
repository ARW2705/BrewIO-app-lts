/* Module imports */
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '../../shared/interfaces';

/* Service imports */
import { CalculationsService } from '../../services/services';


@Component({
  selector: 'app-hops-schedule',
  templateUrl: './hops-schedule.component.html',
  styleUrls: ['./hops-schedule.component.scss'],
})
export class HopsScheduleComponent implements OnChanges, OnInit {
  @Input() refresh: boolean;
  @Input() variant: RecipeVariant;
  @Output() openIngredientFormEvent: EventEmitter<HopsSchedule> = new EventEmitter<HopsSchedule>();
  hopsSchedule: HopsSchedule[] = [];
  ibus: string[] = [];

  constructor(public calculator: CalculationsService) { }

  ngOnInit(): void {
    this.hopsSchedule = this.variant.hops;
    this.setIBUs();
  }

  ngOnChanges(): void {
    this.setIBUs();
  }

  /**
   * Set IBU contributions for each hops addition
   *
   * @param: none
   * @return: none
   */
  setIBUs(): void {
    this.ibus = this.hopsSchedule.map((hopsSchedule: HopsSchedule): string => {
      const ibu: number = this.calculateIBU(hopsSchedule);
      return ibu.toFixed(1);
    });
  }

  /**
   * Calculate the contributing IBU for a single hops instance
   *
   * @param: hopsSchedule - the hops instance to calculate on
   *
   * @return: IBU value of hops instance
   */
  calculateIBU(hopsSchedule: HopsSchedule): number {
    return this.calculator.getIBU(
      hopsSchedule.hopsType,
      hopsSchedule,
      this.variant.originalGravity,
      this.variant.batchVolume,
      this.variant.boilVolume
    );
  }

  /**
   * Open ingredient form modal to update a hops instance
   *
   * @params: hops - the hops instance to update
   *
   * @return: none
   */
  openIngredientFormModal(hops: HopsSchedule): void {
    this.openIngredientFormEvent.emit(hops);
  }

}
