/* Module imports */
import { Component, Input } from '@angular/core';

/* Interface imports */
import { ManualProcess } from '../../shared/interfaces';


@Component({
  selector: 'process-manual',
  templateUrl: './process-manual.component.html',
  styleUrls: ['./process-manual.component.scss']
})
export class ProcessManualComponent {
  @Input() stepData: ManualProcess;

  constructor() { }

}
