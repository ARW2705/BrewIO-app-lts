import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecipeTypeGuardServiceStub {
  public checkTypeSafety(...options) {}
  public getUnsafeRecipeError(...options) {}
  public getDocumentGuardByType(...options) {}
  public isSafeGrainBillCollection(...options) {}
  public isSafeGrainBill(...options) {}
  public isSafeHopsScheduleCollection(...options) {}
  public isSafeHopsSchedule(...options) {}
  public isSafeOtherIngredientsCollection(...options) {}
  public isSafeOtherIngredients(...options) {}
  public isSafeProcessSchedule(...options) {}
  public isSafeRecipeMaster(...options) {}
  public isSafeRecipeVariant(...options) {}
  public isSafeYeastBatchCollection(...options) {}
  public isSafeYeastBatch(...options) {}
}
