/* Module imports */
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Interface imports */
import { ErrorReport } from '../../shared/interfaces';


@Component({
  selector: 'app-error-report',
  templateUrl: './error-report.component.html',
  styleUrls: ['./error-report.component.scss'],
})
export class ErrorReportComponent {
  @Input() reports: ErrorReport[] = [];
  @Input() shouldHideLoginButton: boolean = false;
  showReports: boolean = false;

  constructor(public modalCtrl: ModalController) {}

  /**
   * Dismiss the modal with no data
   *
   * @param: none
   * @return: none
   */
  cancel(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Dismiss the modal and log the error to server
   *
   * @param: none
   * @return: none
   */
  submitError(): void {
    this.modalCtrl.dismiss({ log: true });
  }

  /**
   * Toggle showing full reports
   *
   * @param: none
   * @return: none
   */
  toggleReports(): void {
    this.showReports = !this.showReports;
  }

}
