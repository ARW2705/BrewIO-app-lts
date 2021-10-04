/* Module Imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { ProgressCircleSettings } from '../../../../shared/interfaces';


@Component({
  selector: 'app-progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: ['./progress-circle.component.scss'],
})
export class ProgressCircleComponent {
  @Input() chevronPath: string;
  @Input() settings: ProgressCircleSettings;
  @Input() showButton: boolean;
}
