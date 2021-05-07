export class FilePathStub {
  public resolveNativePath(): Promise<string> {
    return Promise.resolve('native-path');
  }
}
