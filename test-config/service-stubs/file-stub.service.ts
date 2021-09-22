import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileServiceStub {
  public convertCordovaFileToJSFile(...args) { }
  public convertFileEntrytoCordovaFile(...args) { }
  public copyFileToLocalTmpDir(...args) { }
  public deleteLocalFile(...args) { }
  public getLocalFile(...args) { }
  public getLocalUrl(...args) { }
  public getMetadata(...args) { }
  public getPersistentDirPath() { }
  public getTmpDirPath() { }
  public resolveNativePath() { }
}
