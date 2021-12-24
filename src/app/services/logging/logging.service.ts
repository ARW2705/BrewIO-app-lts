/* Module imports */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/* Constant imports */
import { API_VERSION, BASE_URL } from '@shared/constants';

/* Interface imports */
import { ErrorReport } from '@shared/interfaces';

/* Service imports */
import { ConnectionService } from '@services/connection/connection.service';
import { StorageService } from '@services/storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor(
    public connectionService: ConnectionService,
    public http: HttpClient,
    public storage: StorageService
  ) {
    this.connectionService.listenForConnection()
      .subscribe((): void => this.sendReportsOnConnection());
  }

  /**
   * Send error reports to server
   *
   * @param: reports - array of error reports
   * @return: none
   */
  logErrorReports(reports: ErrorReport[]): void {
    console.log('logging reports', reports);
    if (reports && reports.length) {
      this.http.post(`${BASE_URL}/${API_VERSION}/reporting/error`, reports)
        .pipe(catchError((_: any): Observable<any> => this.storeErrorReports(reports)))
        .subscribe((): void => console.log('error reports sent'));
    }
  }

  /**
   * Send any pending error reports to server on reconnect
   *
   * @param: none
   * @return: none
   */
  sendReportsOnConnection(): void {
    this.storage.getErrorReports()
      .subscribe((reports: ErrorReport[]): void => this.logErrorReports(reports));
  }

  /**
   * Store error reports
   *
   * @param: reports - array of error reports to store
   * @return: observable of storage response
   */
  storeErrorReports(reports: ErrorReport[]): Observable<any> {
    return this.storage.getErrorReports()
      .pipe(
        catchError((_: string): Observable<any> => of([])),
        mergeMap((errorReports: ErrorReport[]): Observable<any> => {
          return this.storage.setErrorReports(errorReports.concat(reports));
        })
      );
  }
}
