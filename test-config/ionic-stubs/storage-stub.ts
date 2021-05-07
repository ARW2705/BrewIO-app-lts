import { Injectable } from '@angular/core';

@Injectable()
export class StorageStub {
  storage: any = {};

  constructor() { }

  public clear(): void {
    this.storage = {};
  }

  public get(key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const result = this.storage[key];
      if (result !== undefined) {
        resolve(result);
      } else {
        reject('Key not found');
      }
    });
  }

  public set(key: string, value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.storage[key] = value;
      resolve(value);
    });
  }

  public remove(key: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      delete this.storage[key];
      resolve();
    });
  }
}
