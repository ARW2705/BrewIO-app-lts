/* Module imports */
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { from, Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(
    public errorReporter: ErrorReportingService,
    public modalCtrl: ModalController
  ) { }

  /**
   * Default modal onDidDismiss success handler
   *
   * @param: none
   * @return: function that handles an overlay event
   */
  defaultSuccessHandler<T>(): (event: OverlayEventDetail<T>) => Observable<T> {
    return (event: OverlayEventDetail<T>): Observable<T> => of(event.data);
  }

  /**
   * Open an ionic modal
   *
   * @param: component - the host component for the modal
   * @param: componentProps - contains key:value pairs to send to modal
   * @param: [successHandler] - optional on modal dismiss success function;
   *   defaults to function that returns result returned from modal as observable
   * @param: [errorHandler] - optional on modal dismiss error function;
   *   defaults to error reporting service generic error handler
   * @return: observable of modal return data
   */
  openModal<M, T = M>(
    component: any,
    componentProps: { [key: string]: any },
    successHandler: (event: OverlayEventDetail<M>) => Observable<M | T> = this.defaultSuccessHandler(),
    errorHandler: (error: Error) => Observable<never> = this.errorReporter.handleGenericCatchError()
  ): Observable<M | T> {
    return from(this.openModalHelper<M>(component, componentProps))
      .pipe(
        mergeMap(successHandler),
        catchError(errorHandler)
      );
  }

  /**
   * Ion modal helper function; set up modal and return its promise
   *
   * @param: component - the host component for the modal
   * @param: componentProps - object containing key:value pairs to send to modal
   * @return: modal onDidDismiss promise
   */
  async openModalHelper<M>(component: any, componentProps: object): Promise<OverlayEventDetail<M>> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({ component, componentProps });
    await modal.present();
    return modal.onDidDismiss<M>();
  }
}
