/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { Process } from '../../shared/interfaces/process';


@Component({
  selector: 'process-manual',
  templateUrl: './process-manual.component.html',
  styleUrls: ['./process-manual.component.scss']
})
export class ProcessManualComponent {
  @Input() isPreview: boolean;
  @Input() stepData: Process;

  constructor() { }

}
