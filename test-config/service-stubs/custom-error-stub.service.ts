import { Injectable } from '@angular/core';

export class CustomErrorStub extends Error {
  severity: number;
  userMessage: string;

  constructor(
    name: string,
    message: string,
    severity: number,
    userMessage: string
  ) {
    super(message);
    this.name = name;
    this.severity = severity;
    this.userMessage = userMessage;
  }

}

@Injectable()
export class CustomErrorServiceStub {
  public getCustomError() { }
  public getCustomErrorReport() { }
  public getCustomReportFromError() { }
  public getCustomReportFromHttpError() { }
  public getHeaders() { }
  public getTimestamp() { }
  public getUnhandledError() { }
  public getUnhandledErrorMessage() { }
  public handleGenericCatchError() { }
  public handleResolveableCatchError() {}
}
