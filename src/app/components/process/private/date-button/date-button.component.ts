/* Module imports */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';


@Component({
  selector: 'app-date-button',
  templateUrl: './date-button.component.html',
  styleUrls: ['./date-button.component.scss'],
})
export class DateButtonComponent implements OnChanges {
  @Input() date: moment.Moment;
  @Input() isMonth: boolean;
  @Input() isProjected: boolean;
  @Input() isStart: boolean;
  svgClass: string = 'base';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      let _svgClass: string = 'base';
      if (changes.isStart && changes.isStart.currentValue) {
        _svgClass += ' start';
      } else if (changes.isProjected && changes.isProjected.currentValue) {
        _svgClass += ' projected';
      } else if ((changes.isMonth && changes.isMonth.currentValue) || this.isMonth) {
        _svgClass += ' month';
      }
      this.svgClass = _svgClass;
    }
  }

}
