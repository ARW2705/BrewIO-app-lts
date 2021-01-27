/* Module imports */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
})
export class DateButtonComponent implements OnChanges {
  @Input() date: moment.Moment;
  @Input() isStart: boolean;
  @Input() isProjected: boolean;
  @Input() isMonth: boolean;
  svgClass: string = 'base';


  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.svgClass = 'base';
      if (changes.isStart && changes.isStart.currentValue) {
        this.svgClass += ' start';
      } else if (changes.isProjected && changes.isProjected.currentValue) {
        this.svgClass += ' projected';
      } else if (
        (changes.isMonth && changes.isMonth.currentValue) || this.isMonth
      ) {
        this.svgClass += ' month';
      }
    }
  }

}
