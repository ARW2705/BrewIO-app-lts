/* Module Imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { ProgressCircleSettings } from '../../shared/interfaces';

@Component({
  selector: 'progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: ['./progress-circle.component.scss'],
})
export class ProgressCircleComponent {
  @Input() settings: ProgressCircleSettings;
  @Input() showButton: boolean;
  @Input() chevronPath: string;

  constructor() { }

}
