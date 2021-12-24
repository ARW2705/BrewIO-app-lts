/* Module imports */
import { Pipe, PipeTransform } from '@angular/core';

/* Service imports */
import { TimerService } from '@services/public';


@Pipe({
  name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {

  constructor(public timerService: TimerService) {}

  /**
   * Format time value to text
   */
  transform(value: string, formatType: string): string {
    switch (formatType) {
      case 'duration':
        return this.formatDuration(parseFloat(value));
      default:
        return value;
    }
  }

  /**
   * Convert a duration in minutes to text
   *
   * @params: duration - in minutes
   *
   * @return: formatted string of minutes in n hours m minutes
   */
  formatDuration(duration: number): string {
    return this.timerService.getFormattedDurationString(duration);
  }
}
