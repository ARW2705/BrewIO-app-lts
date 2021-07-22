/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, Validators } from '@angular/forms';

/* Service imports */
import { UtilityService } from '../../../services/services';


@Component({
  selector: 'page-note-form',
  templateUrl: './note-form.page.html',
  styleUrls: ['./note-form.page.scss']
})
export class NoteFormPage implements OnInit {
  @Input() formMethod: string;
  @Input() noteType: string;
  @Input() toUpdate: string;
  note: FormControl = null;
  onBackClick: () => void;
  title: string = '';

  constructor(
    public modalCtrl: ModalController,
    public utilService: UtilityService
  ) {
    this.onBackClick = this.dismiss.bind(this);
  }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.title = `${this.utilService.toTitleCase(this.noteType)} Note`;
    this.note = new FormControl(this.toUpdate, [Validators.maxLength(500)]);
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Call ModalController dismiss method with no additional data
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Call ModalController dismiss method with deletion flag
   *
   * @params: none
   * @return: none
   */
  onDelete(): void {
    this.modalCtrl.dismiss({method: 'delete'});
  }

  /**
   * Call ModalController dismiss method with form data
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    this.modalCtrl.dismiss({
      method: this.formMethod,
      note: this.note.value
    });
  }

  /***** End Form Methods *****/

}
