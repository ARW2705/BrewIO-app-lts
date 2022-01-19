/* Module imports */
import { Injectable } from '@angular/core';

/* Constants imports */
import { HIGH_SEVERITY } from '@shared/constants';

/* Interface imports */
import { DocumentGuard, GrainBill, HopsSchedule, OtherIngredients, Process, RecipeVariant, YeastBatch } from '@shared/interfaces';

/* Type guard imports */
import { CalendarProcessGuardMetadata, GrainBillGuardMetadata, HopsScheduleGuardMetadata, ManualProcessGuardMetadata, OtherIngredientsGuardMetadata, ProcessGuardMetadata, RecipeMasterGuardMetadata, RecipeVariantGuardMetadata, TimerProcessGuardMetadata, YeastBatchGuardMetadata } from '@shared/type-guard-metadata';

/* Type imports */
import { CustomError } from '@shared/types';

/* Service imports */
import { ImageService } from '@services/image/image.service';
import { LibraryService } from '@services/library/library.service';
import { TypeGuardService } from '@services/type-guard/type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class RecipeTypeGuardService {

  constructor(
    public imageService: ImageService,
    public libraryService: LibraryService,
    public typeGuard: TypeGuardService
  ) { }

  /**
   * Check types of recipe master or variant properties; throw appropriate error if recipe is unsafe
   *
   * @param: recipe - expected to be either RecipeMaster or RecipeVariant, but can check any,
   * @return: none
   */
  checkTypeSafety(recipe: any): void {
    const isRecipeMaster: boolean = recipe && recipe.hasOwnProperty('variants');
    if (isRecipeMaster && !this.isSafeRecipeMaster(recipe)) {
      throw this.getUnsafeRecipeError(recipe, 'master');
    } else if (!isRecipeMaster && !this.isSafeRecipeVariant(recipe)) {
      throw this.getUnsafeRecipeError(recipe, 'variant');
    }
  }

  /**
   * Throw a custom error when an invalid recipe is encountered
   *
   * @param: thrownFor - given recipe object that failed validation
   * @return: custom invalid recipe error
   */
  getUnsafeRecipeError(thrownFor: any, recipeType: string): Error {
    return new CustomError(
      'RecipeError',
      `Given ${recipeType} is invalid: got ${JSON.stringify(thrownFor, null, 2)}`,
      HIGH_SEVERITY,
      `An internal error occurred: invalid ${recipeType}`
    );
  }

  /**
   * Get the process type specific document type guard
   *
   * @param: processType - the specific type of process to check: either 'manual', 'timer', or 'calendar'
   * @return: the combined common and specific process type guard data
   */
  getDocumentGuardByType(processType: string): DocumentGuard {
    let SpecificValidations: DocumentGuard;
    if (processType === 'manual') {
      SpecificValidations = ManualProcessGuardMetadata;
    } else if (processType === 'timer') {
      SpecificValidations = TimerProcessGuardMetadata;
    } else if (processType === 'calendar') {
      SpecificValidations = CalendarProcessGuardMetadata;
    } else {
      throw new CustomError(
        'TypeGuardError',
        `Invalid process type on type guard validation: ${processType}`,
        HIGH_SEVERITY,
        'An internal check error occurred, Process is malformed'
      );
    }

    return this.typeGuard.concatGuards(ProcessGuardMetadata, SpecificValidations);
  }

  /**
   * Check if array of grain bills correctly implement the GrainBill interface
   *
   * @param: grainBill - expects an array of GrainBill objects
   * @return: true if all items in array correctly implement GrainBill
   */
  isSafeGrainBillCollection(grainBill: GrainBill[]): boolean {
    return grainBill.every((grainBillInstance: GrainBill): boolean => {
      return this.isSafeGrainBill(grainBillInstance);
    });
  }

  /**
   * Check if grain bill correctly implement the GrainBill interface
   *
   * @param: grainBill - expects a GrainBill objects
   * @return: true if object correctly implement GrainBill
   */
  isSafeGrainBill(grainBill: GrainBill): boolean {
    return (
      this.typeGuard.hasValidProperties(grainBill, GrainBillGuardMetadata)
      && this.libraryService.isSafeGrains(grainBill.grainType)
    );
  }

  /**
   * Check if array of hops schedule correctly implement the HopsSchedule interface
   *
   * @param: hopsSchedule - expects an array of HopsSchedule objects
   * @return: true if all items in array correctly implement HopsSchedule
   */
  isSafeHopsScheduleCollection(hopsSchedule: HopsSchedule[]): boolean {
    return hopsSchedule.every((hopsScheduleInstance: HopsSchedule): boolean => {
      return this.isSafeHopsSchedule(hopsScheduleInstance);
    });
  }

  /**
   * Check if hops schedule correctly implement the HopsSchedule interface
   *
   * @param: hopsSchedule - expects a HopsSchedule objects
   * @return: true if object correctly implement HopsSchedule
   */
  isSafeHopsSchedule(hopsSchedule: HopsSchedule): boolean {
    return (
      this.typeGuard.hasValidProperties(hopsSchedule, HopsScheduleGuardMetadata)
      && this.libraryService.isSafeHops(hopsSchedule.hopsType)
    );
  }

  /**
   * Check if other ingredients correctly implement the OtherIngredients interface
   *
   * @param: otherIngredients - expects a OtherIngredients objects
   * @return: true if object correctly implement OtherIngredients
   */
  isSafeOtherIngredientsCollection(otherIngredients: OtherIngredients[]): boolean {
    return otherIngredients.every((otherIngredientsInstance: OtherIngredients): boolean => {
      return this.isSafeOtherIngredients(otherIngredientsInstance);
    });
  }

  /**
   * Check if other ingredients correctly implement the OtherIngredients interface
   *
   * @param: otherIngredients - expects a OtherIngredients objects
   * @return: true if object correctly implement OtherIngredients
   */
  isSafeOtherIngredients(otherIngredients: OtherIngredients): boolean {
    return this.typeGuard.hasValidProperties(otherIngredients, OtherIngredientsGuardMetadata);
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
    return schedule.every((process: Process): boolean => {
      const validation: DocumentGuard = this.getDocumentGuardByType(process.type);
      return this.typeGuard.hasValidProperties(process, validation);
    });
  }

  /**
   * Check if given recipe object is valid by correctly implementing the RecipeMaster interface
   *
   * @param: recipe - expects a RecipeMaster at runtime
   * @return: true if given recipe correctly implements RecipeMaster interface
   */
  isSafeRecipeMaster(recipe: any): boolean {
    if (!this.typeGuard.hasValidProperties(recipe, RecipeMasterGuardMetadata)) {
      console.error('recipe master base properties are invalid', recipe);
      return false;
    }

    if (recipe.labelImage && !this.imageService.isSafeImage(recipe.labelImage)) {
      console.error('recipe master label image is invalid', recipe.labelImage);
      return false;
    }

    if (!this.libraryService.isSafeStyle(recipe.style)) {
      console.error('recipe master style is invalid', recipe.style);
      return false;
    }

    if (!recipe.variants.every((variant: RecipeVariant): boolean => this.isSafeRecipeVariant(variant))) {
      console.error('recipe master has an invalid variant', recipe.variants);
      return false;
    }

    return true;
  }

  /**
   * Check if given recipe object is valid by correctly implementing the RecipeVariant interface
   *
   * @param: recipe - expects a RecipeVariant at runtime
   * @return: true if given recipe correctly implements RecipeVariant interface
   */
  isSafeRecipeVariant(recipe: any): boolean {
    if (!this.typeGuard.hasValidProperties(recipe, RecipeVariantGuardMetadata)) {
      console.error('recipe variant base properties invalid', recipe);
      return false;
    }

    if (!this.isSafeGrainBillCollection(recipe.grains)) {
      console.error('recipe variant grain bill invalid', recipe.grains);
      return false;
    }

    if (!this.isSafeHopsScheduleCollection(recipe.hops)) {
      console.error('recipe variant hops schedule invalid', recipe.hops);
      return false;
    }

    if (!this.isSafeYeastBatchCollection(recipe.yeast)) {
      console.error('recipe variant yeast batch invalid', recipe.yeast);
      return false;
    }

    if (!this.isSafeOtherIngredientsCollection(recipe.otherIngredients)) {
      console.error('recipe variant other ingredients invalid', recipe.otherIngredients);
      return false;
    }

    if (!this.isSafeProcessSchedule(recipe.processSchedule)) {
      console.error('recipe variant process schedule invalid', recipe.processSchedule);
      return false;
    }

    return true;
  }

  /**
   * Check if array of yeast batch correctly implement the YeastBatch interface
   *
   * @param: yeastBatch - expects an array of YeastBatch objects
   * @return: true if all items in array correctly implement YeastBatch
   */
  isSafeYeastBatchCollection(yeastBatch: YeastBatch[]): boolean {
    return yeastBatch.every((yeastBatchInstance: YeastBatch): boolean => {
      return this.isSafeYeastBatch(yeastBatchInstance);
    });
  }

  /**
   * Check if yeast batch correctly implement the YeastBatch interface
   *
   * @param: yeastBatch - expects a YeastBatch objects
   * @return: true if object correctly implement YeastBatch
   */
  isSafeYeastBatch(yeastBatch: YeastBatch): boolean {
    return (
      this.typeGuard.hasValidProperties(yeastBatch, YeastBatchGuardMetadata)
      && this.libraryService.isSafeYeast(yeastBatch.yeastType)
    );
  }
}
