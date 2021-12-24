import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss'],
})
export class FormCheckboxComponent implements OnChanges {
  @Input() control: FormControl;
  @Input() label: string = null;
  @Input() overrideTitleCase: boolean = false;
  @Output() ionCheckboxEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnChanges(): void {
    if (!this.control) {
      this.control = new FormControl();
    }
  }

  /**
   * Emit checkbox change event
   *
   * @param: event - the triggering event
   *
   * @return: none
   */
  onCheckBoxChange(event: CustomEvent): void {
    this.ionCheckboxEvent.emit(event.detail.checked);
  }

}
