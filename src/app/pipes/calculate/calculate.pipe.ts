/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

/* Interface imports */
import { HopsSchedule, RecipeVariant } from '../../shared/interfaces';

/* Provider imports */
import { CalculationsService } from '../../services/services';


@Pipe({
  name: 'calculate',
})
export class CalculatePipe implements PipeTransform {

  constructor(public calculator: CalculationsService) { }

  /**
   * Perform a particular calculation for display
   *
   * @params: inputSource - object to base calculation on
   * @params: calculation - the type of value to calculate
   * @params: dataset - relevant data to perform calculation
   * @params: [refresh] - used as flag for pipe to recalculate only
   *
   * @return: formatted result of calculation
   */
  transform(inputSource: object, calculation: string, dataset: object, refresh?: boolean): string {
    if (calculation === 'ibu') {
      return `${this.getIBU(<HopsSchedule>inputSource, <RecipeVariant>dataset).toFixed(1)} IBU`;
    } else {
      return '';
    }
  }

  /**
   * Get the contributing IBU for a hops schedule instance
   *
   * @params: hops - hops schedule to base calculation on
   * @params: variant - the recipe variant with relevant data
   *
   * @return: IBU of the hops instance
   */
  getIBU(hops: HopsSchedule, variant: RecipeVariant): number {
    try {
      return this.calculator.getIBU(
        hops.hopsType,
        hops,
        variant.originalGravity,
        variant.batchVolume,
        variant.boilVolume
      );
    } catch (error) {
      console.log('Calculate pipe error', error);
      return 0;
    }
  }
}
