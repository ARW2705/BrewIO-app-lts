/* Module imports */
import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-process-header',
  templateUrl: './process-header.component.html',
  styleUrls: ['./process-header.component.scss'],
})
export class ProcessHeaderComponent {
  @Input() headerText: string;
  @Input() isExpired: boolean;
  @Input() isPreview: boolean;
  @Output() toggleShowDescriptionEvent: EventEmitter<null> = new EventEmitter<null>();

  /**
   * Emit description visibility toggle event
   *
   * @param: none
   * @return: none
   */
  toggleShowDescription(): void {
    this.toggleShowDescriptionEvent.emit();
  }
}
