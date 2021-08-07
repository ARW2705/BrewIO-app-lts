/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-preferences-toggle',
  templateUrl: './preferences-toggle.component.html',
  styleUrls: ['./preferences-toggle.component.scss'],
})
export class PreferencesToggleComponent {
  @Input() control: FormControl;
  @Input() preferenceName: string;
  @Input() preferenceUnit: string;
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
