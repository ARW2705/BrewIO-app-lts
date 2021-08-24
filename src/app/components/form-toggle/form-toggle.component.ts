/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-form-toggle',
  templateUrl: './form-toggle.component.html',
  styleUrls: ['./form-toggle.component.scss'],
})
export class FormToggleComponent {
  @Input() control: FormControl;
  @Input() toggleName: string;
  @Input() toggleAdditionalName?: string;
  @Output() toggleEvent: EventEmitter<CustomEvent> = new EventEmitter<CustomEvent>();

  /**
   * Handle IonToggle event and re-emit to parent component
   *
   * @param: event - the ion toggle event
   *
   * @return: none
   */
  onToggle(event: CustomEvent): void {
    this.toggleEvent.emit(event);
  }
}
