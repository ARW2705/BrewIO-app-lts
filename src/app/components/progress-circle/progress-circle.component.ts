/* Module Imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { ProgressCircleSettings } from '../../shared/interfaces/progress-circle';

@Component({
  selector: 'progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: ['./progress-circle.component.scss'],
})
export class ProgressCircleComponent {
  @Input() settings: ProgressCircleSettings;

  constructor() { }

}
