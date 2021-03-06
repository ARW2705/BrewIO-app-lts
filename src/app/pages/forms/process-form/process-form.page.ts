/* Module imports */
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

/* Utility function imports */
import { toTitleCase } from '../../../shared/utility-functions/utilities';

/* Interface imports */
import { Process } from '../../../shared/interfaces/process';


@Component({
  selector: 'page-process-form',
  templateUrl: './process-form.page.html',
  styleUrls: ['./process-form.page.scss']
})
export class ProcessFormPage implements OnInit {
  @Input() formMode: string;
  @Input() processType: string;
  @Input() update: Process;
  onBackClick: () => void;
  processForm: FormGroup = null;
  title: string = '';

  constructor(
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController
  ) {
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.title = toTitleCase(this.processType);
    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Add form controls for the specific process type
   *
   * @params: none
   * @return: none
   */
  addFormSpecificControls(): void {
    if (this.processType === 'manual') {
      this.processForm.addControl('expectedDuration', new FormControl());
    } else {
      if (this.processType === 'timer') {
        this.processForm.addControl('concurrent', new FormControl(false));
        this.processForm.addControl('splitInterval', new FormControl(1));
      }
      this.processForm
        .addControl(
          'duration',
          new FormControl('', [Validators.required, Validators.min(0)])
        );
    }
  }

  /**
   * Call ModalController dismiss method with deletion flag
   *
   * @params: none
   * @return: none
   */
  deleteStep(): void {
    this.modalCtrl.dismiss({delete: true});
  }

  /**
   * Call ModalController dismiss method with no data
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Initialize form base on process type
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.processForm = this.formBuilder.group({
      type: this.processType,
      name: [
        '',
        [Validators.minLength(2), Validators.maxLength(50), Validators.required]
      ],
      description: ['', [Validators.maxLength(500)]]
    });

    this.addFormSpecificControls();
    this.mapUpdateToForm();
  }

  /**
   * Map given update values to form values, if update passed to page
   *
   * @params: none
   * @return: none
   */
  mapUpdateToForm(): void {
    if (this.update) {
      const control: {[key: string]: AbstractControl} = this.processForm.controls;
      control['name'].setValue(this.update.name);
      control['description'].setValue(this.update.description);

      if (this.update.type === 'manual') {
        control['expectedDuration'].setValue(this.update.expectedDuration);
      } else {
        if (this.update.type === 'timer') {
          control['concurrent'].setValue(this.update.concurrent);
          control['splitInterval'].setValue(this.update.splitInterval);
        }
        control['duration'].setValue(this.update.duration);
      }
    }
  }

  /**
   * Call ModalController dismiss with form data
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    if (this.formMode === 'create') {
      this.modalCtrl.dismiss(this.processForm.value);
    } else {
      this.modalCtrl.dismiss({update: this.processForm.value});
    }
  }

  /***** End Form Methods *****/

}
