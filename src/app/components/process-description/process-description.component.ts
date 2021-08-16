/* Module imports */
import { Component, Input, OnChanges } from '@angular/core';


@Component({
  selector: 'app-process-description',
  templateUrl: './process-description.component.html',
  styleUrls: ['./process-description.component.scss'],
})
export class ProcessDescriptionComponent implements OnChanges {
  @Input() description: string;
  @Input() isTimer: boolean;

  ngOnChanges(): void {
    if (!this.description) {
      this.description = 'Description not available';
    }
  }
}
