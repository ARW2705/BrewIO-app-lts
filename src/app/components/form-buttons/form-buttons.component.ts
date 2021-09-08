import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-form-buttons',
  templateUrl: './form-buttons.component.html',
  styleUrls: ['./form-buttons.component.scss'],
})
export class FormButtonsComponent {
  @Input() isSubmitDisabled: boolean;
  @Input() shouldCautionSubmit: boolean;
  @Output() cancelEvent: EventEmitter<null> = new EventEmitter<null>();
  @Output() submitEvent: EventEmitter<null> = new EventEmitter<null>();

  cancel(): void {
    this.cancelEvent.emit();
  }

  submit(): void {
    this.submitEvent.emit();
  }
}
