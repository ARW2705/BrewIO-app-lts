/* Module imports */
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

/* Constant imports */
import { DESCRIPTION_MAX_LENGTH } from '@shared/constants';

/* Service imports */
import { UtilityService } from '@services/public';


@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss']
})
export class NoteFormComponent implements OnInit {
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
    this.note = new FormControl(this.toUpdate, [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]);
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Call ModalController dismiss method with no additional data
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
  onDelete(): void {
    this.modalCtrl.dismiss({method: 'delete'});
  }

  /**
   * Call ModalController dismiss method with form data
   *
   * @param: none
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
