/* Module imports */
import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';

/* Animation imports */
import { expandUpDown } from '../../animations/expand';


@Component({
  selector: 'accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  animations: [
    expandUpDown()
  ]
})
export class AccordionComponent implements OnChanges {
  @Input() expanded: boolean;
  @ViewChild('accordionContainer', {read: ElementRef}) container: ElementRef;
  expand: object = {
    value: 'collapsed',
    params: {
      maxHeight: 0
    }
  };

  constructor() { }

  /***** Lifecycle Hooks *****/

  ngOnChanges(): void {
    if (this.container) {
      this.expand = {
        value: this.expanded ? 'expanded' : 'collapsed',
        params: {
          maxHeight: this.expanded ? 2000 : 0,
          speed: 250
        }
      };
    }
  }

  /***** End Lifecycle Hooks *****/

}
