import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityServiceStub {
  public clone() {}
  public compareWith() {}
  public getArrayFromSubjects<T>() {}
  public toSubjectArray<T>() {}
  public roundToDecimalPlace() {}
  public stripSharedProperties() {}
  public toTitleCase() {}
}
