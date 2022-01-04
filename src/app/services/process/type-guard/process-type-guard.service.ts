/* Module imports */
import { Injectable } from '@angular/core';

/* Constant imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { Alert, Batch, BatchAnnotations, BatchContext, BatchProcess, PrimaryValues, Process } from '@shared/interfaces';

/* Type guard imports */
import { AlertGuardMetadata, BatchAnnotationsGuardMetadata, BatchContextGuardMetadata, BatchGuardMetadata, BatchProcessGuardMetadata, PrimaryValuesGuardMetadata } from '@shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { RecipeService } from '@services/recipe/recipe.service';
import { TypeGuardService } from '@services/type-guard/type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class ProcessTypeGuardService {

  constructor(
    public recipeService: RecipeService,
    public typeGuard: TypeGuardService
  ) { }

  /**
   * Runtime check given Batch for type correctness; throws error on check failed
   *
   * @param: batch - the batch to check
   * @return: none
   */
  checkTypeSafety(batch: any): void {
    if (!this.isSafeBatch(batch)) {
      throw this.getUnsafeError(batch);
    }
  }

  /**
   * Get a custom error on unsafe batch type
   *
   * @param: thrownFor - the original error thrown
   * @return: new custom error
   */
  getUnsafeError(thrownFor: any): CustomError {
    return new CustomError(
      'BatchError',
      `Batch is invalid: got ${JSON.stringify(thrownFor, null, 2)}`,
      HIGH_SEVERITY,
      'An internal error occurred: invalid batch'
    );
  }

  /**
   * Check if given alerts are valid by correctly implementing the Alert interface
   *
   * @param: alerts - expects an array of Alerts at runtime
   * @return: true if all alerts correctly implement Alert interface
   */
  isSafeAlerts(alerts: Alert[]): boolean {
    return alerts.every((alert: Alert): boolean => {
      return this.typeGuard.hasValidProperties(alert, AlertGuardMetadata);
    });
  }

  /**
   * Check if given batch object is valid by correctly implementing the Batch interface
   *
   * @param: batch - expects a Batch at runtime
   * @return: true if given batch correctly implements Batch interface
   */
  isSafeBatch(batch: Batch): boolean {
    return (
      this.typeGuard.hasValidProperties(batch, BatchGuardMetadata)
      && this.isSafeBatchAnnotations(batch.annotations)
      && this.isSafeBatchContext(batch.contextInfo)
      && this.isSafeBatchProcess(batch.process)
    );
  }

  /**
   * Check if given batch annotations object is valid by correctly implementing the BatchAnnotations interface
   *
   * @param: annotations - expects a BatchAnnotations at runtime
   * @return: true if given annotations correctly implements BatchAnnotations interface
   */
  isSafeBatchAnnotations(annotations: BatchAnnotations): boolean {
    return (
      this.typeGuard.hasValidProperties(annotations, BatchAnnotationsGuardMetadata)
      && this.isSafePrimaryValues(annotations.targetValues)
      && this.isSafePrimaryValues(annotations.measuredValues)
    );
  }

  /**
   * Check if given batch context object is valid by correctly implementing the BatchContext interface
   *
   * @param: context - expects a BatchContext at runtime
   * @return: true if given context correctly implements BatchContext interface
   */
  isSafeBatchContext(context: BatchContext): boolean {
    return (
      this.typeGuard.hasValidProperties(context, BatchContextGuardMetadata)
      && this.recipeService.isSafeGrainBillCollection(context.grains)
      && this.recipeService.isSafeHopsScheduleCollection(context.hops)
      && this.recipeService.isSafeYeastBatchCollection(context.yeast)
      && this.recipeService.isSafeOtherIngredientsCollection(context.otherIngredients)
    );
  }

  /**
   * Check if given batch process object is valid by correctly implementing the BatchProcess interface
   *
   * @param: batchProcess - expects a BatchProcess at runtime
   * @return: true if given annotations correctly implements BatchProcess interface
   */
  isSafeBatchProcess(batchProcess: BatchProcess): boolean {
    return (
      this.typeGuard.hasValidProperties(batchProcess, BatchProcessGuardMetadata)
      && this.isSafeProcessSchedule(batchProcess.schedule)
      && this.isSafeAlerts(batchProcess.alerts)
    );
  }

  /**
   * Check if given primary values object is valid by correctly implementing the PrimaryValues interface
   *
   * @param: values - expects a PrimaryValues at runtime
   * @return: true if given primary values correctly implements PrimaryValues interface
   */
  isSafePrimaryValues(values: PrimaryValues): boolean {
    return this.typeGuard.hasValidProperties(values, PrimaryValuesGuardMetadata);
  }

  /**
   * Check if given process schedule array is valid by correctly implementing the Process interface
   * as well as the appropriate extended interface defined by the type property
   *
   * @param: schedule - expects array of Process objects at runtime
   * @return: true if all processes within schedule implements the Process interface as well as their
   * individual extended interface
   */
  isSafeProcessSchedule(schedule: Process[]): boolean {
    return this.recipeService.isSafeProcessSchedule(schedule);
  }

}
