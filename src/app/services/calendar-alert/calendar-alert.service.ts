/* Module imports */
import { Injectable } from '@angular/core';

/* Interface imports */
import { Alert, BatchProcess } from '@shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class CalendarAlertService {

  /**
   * Remove alerts for the current step
   *
   * @param: none
   * @return: none
   */
  clearAlertsForCurrentStep(batchProcess: BatchProcess): void {
    batchProcess.alerts = batchProcess.alerts.filter((alert: Alert): boolean => {
      return alert.title !== batchProcess.schedule[batchProcess.currentStep].name;
    });
  }

  /**
   * Get alerts associated with the current step
   *
   * @param: none
   *
   * @return: Array of alerts
   */
  getAlerts(batchProcess: BatchProcess): Alert[] {
    return batchProcess.alerts.filter((alert: Alert): boolean => {
      return alert.title === batchProcess.schedule[batchProcess.currentStep].name;
    });
  }

  /**
   * Get alert for a particular step that is closest to the present datetime
   *
   * @param: none
   * @return: alert that is closest to the current datetime
   */
  getClosestAlertByGroup(alerts: Alert[]): Alert {
    if (alerts.length) {
      const now: number = new Date().getTime();
      return alerts.reduce(
        (acc: Alert, curr: Alert): Alert => {
          const accDiff: number = new Date(acc.datetime).getTime() - now;
          const currDiff: number = new Date(curr.datetime).getTime() - now;
          const isCurrCloser: boolean = Math.abs(currDiff) < Math.abs(accDiff) && currDiff > 0;
          return isCurrCloser ? curr : acc;
        }
      );
    }

    return null;
  }
}
