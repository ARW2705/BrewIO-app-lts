/* Module imports */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

/* Interface imports */
import { Process } from '../../../../shared/interfaces';

/* Component imports */
import { ProcessCalendarFormComponent } from '../process-calendar-form/process-calendar-form.component';
import { ProcessManualFormComponent } from '../process-manual-form/process-manual-form.component';
import { ProcessTimerFormComponent } from '../process-timer-form/process-timer-form.component';

/* Service imports */
import { UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-process-form',
  templateUrl: './process-form.component.html',
  styleUrls: ['./process-form.component.scss']
})
export class ProcessFormComponent implements OnInit {
  @Input() processType: string;
  @Input() update: Process;
  @ViewChild('form') formRef: ProcessCalendarFormComponent | ProcessManualFormComponent | ProcessTimerFormComponent;
  formType: string;
  isFormValid: boolean = false;
  onBackClick: () => void;
  title: string = '';

  constructor(
    public modalCtrl: ModalController,
    public utilService: UtilityService
  ) {
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit(): void {
    this.title = this.utilService.toTitleCase(this.processType);
    this.formType = this.update ? 'update' : 'create';
    if (this.update) {
      this.setFormValidity(true);
    }
  }

  /***** End Lifecycle Hooks *****/

  /**
   * Call ModalController dismiss method with no data
   *
   * @param: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Call ModalController dismiss method with deletion flag
   *
   * @param: none
   * @return: none
   */
  onDeletion(): void {
    this.modalCtrl.dismiss({delete: true});
  }

  /**
   * Call ModalController dismiss with form data
   *
   * @param: none
   * @return: none
   */
  onSubmit(): void {
    this.modalCtrl.dismiss(this.formRef.getFormResult());
  }

  /**
   * Update form valid flag
   *
   * @param: isValid - true if form is currently valid
   * @return: none
   */
  setFormValidity(isValid: boolean): void {
    this.isFormValid = isValid;
  }

}
