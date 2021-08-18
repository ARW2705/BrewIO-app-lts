/* Module imports */
import { ViewContainerRef } from '@angular/core';

export class ViewContainerRefStub extends ViewContainerRef {
  get element(): any { return null; }
  get injector(): any { return null; }
  get parentInjector(): any { return null; }
  clear(): void {}
  get(index: number): any {}
  get length(): number { return 0; }
  createEmbeddedView<T>(...options: any[]): any {}
  createComponent<T>(...options: any[]): any {}
  insert(...options: any[]): any {}
  move(...options: any[]): any {}
  indexOf(...options: any[]): number { return 0; }
  remove(...options: any[]): void {}
  detach(...options: any[]): any {}
}
