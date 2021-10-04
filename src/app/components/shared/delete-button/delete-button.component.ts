import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-delete-button',
  templateUrl: './delete-button.component.html',
  styleUrls: ['./delete-button.component.scss'],
})
export class DeleteButtonComponent {
  @Output() deleteEvent: EventEmitter<null> = new EventEmitter<null>();

  onDeletion(): void {
    this.deleteEvent.emit();
  }
}
