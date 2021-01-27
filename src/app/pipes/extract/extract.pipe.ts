/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

/* Interface imports */
import { GrainBill } from '../../shared/interfaces/grain-bill';
import { HopsSchedule } from '../../shared/interfaces/hops-schedule';
import { YeastBatch } from '../../shared/interfaces/yeast-batch';
import { OtherIngredients } from '../../shared/interfaces/other-ingredients';


@Pipe({
  name: 'extract'
})
export class ExtractPipe implements PipeTransform {

  transform(source: object, dataType: string, ...options: any[]): string {
    if (dataType === 'ingredientName') {
      return this.extractIngredientName(source, options);
    }

    return '';
  }

  extractIngredientName(source: object, ...options: any[]): string {
    try {
      const ingredientType = options[0];
      if (options[0] === 'grains') {
        return (<GrainBill>source).grainType.name;
      }
      switch (ingredientType) {
        case 'grains':
          return (<GrainBill>source).grainType.name;
        case 'hops':
          return (<HopsSchedule>source).hopsType.name;
        case 'yeast':
          return (<YeastBatch>source).yeastType.name;
        case 'other':
          return (<OtherIngredients>source).name;
        default:
          break;
      }
    } catch (error) {
      console.log('extract ingredient pipe error', error);
    }

    return '';
  }

}
