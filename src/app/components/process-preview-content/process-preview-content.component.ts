/* Module imports */
import { Component, Input, OnInit } from '@angular/core';

/* Interface imports */
import { CalendarProcess, ManualProcess, Process, TimerProcess } from '../../shared/interfaces';

/* Service imports */
import { TimerService } from '../../services/services';


@Component({
  selector: 'app-process-preview-content',
  templateUrl: './process-preview-content.component.html',
  styleUrls: ['./process-preview-content.component.scss'],
})
export class ProcessPreviewContentComponent implements OnInit {
  @Input() process: Process;
  contentToDisplay: { subject: string, predicate: string }[] = [];
  isHopsTimer: boolean = false;

  constructor(public timerService: TimerService) {}

  ngOnInit(): void {
    if (this.process.type === 'calendar') {
      this.setCalendarProcessContent();
    } else if (this.process.type === 'manual' && (<ManualProcess>this.process).expectedDuration) {
      this.setManualProcessContent();
    } else if (this.process.type === 'timer') {
      this.setTimerProcessContent();
    }
  }

  /**
   * Set the text content for a calendar process: contains duration
   *
   * @param: none
   * @return: none
   */
  setCalendarProcessContent(): void {
    this.contentToDisplay.push({
      subject: 'Duration:',
      predicate: `${(<CalendarProcess>this.process).duration} days`
    });
  }

  /**
   * Set the text content for a calendar process: may contain expected duration
   *
   * @param: none
   * @return: none
   */
  setManualProcessContent(): void {
    this.contentToDisplay.push({
      subject: 'Expected Duration:',
      predicate: `${(<ManualProcess>this.process).expectedDuration} minutes`
    });
  }

  /**
   * Set the text content for a calendar process: contains duration and split interval
   *
   * @param: none
   * @return: none
   */
  setTimerProcessContent(): void {
    this.isHopsTimer = this.process.name.toLowerCase().includes('hops');
    const duration: string = this.timerService.getFormattedDurationString(
      (<TimerProcess>this.process).duration
    );
    const delimiter: number = duration.indexOf(':');
    this.contentToDisplay.push({
      subject: duration.substring(0, delimiter + 1),
      predicate: duration.substring(delimiter + 1, duration.length)
    });
    this.contentToDisplay.push({
      subject: 'Interval:',
      predicate: `${(<TimerProcess>this.process).splitInterval}`
    });
  }
}
