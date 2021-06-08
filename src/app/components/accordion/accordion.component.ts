/* Module imports */
import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Animation } from '@ionic/angular';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';


@Component({
  selector: 'accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnChanges {
  @Input() expanded: boolean;
  @Input() animationDuration: number = 250;
  @ViewChild('accordionContainer', {read: ElementRef}) container: ElementRef;

  constructor(public animationService: AnimationsService) { }

  /***** Lifecycle Hooks *****/

  ngOnChanges(): void {
    this.playAnimation();
  }

  /***** End Lifecycle Hooks *****/

  /**
   * Play vertical expand or collapse animation
   *
   * @params: none
   * @return: none
   */
  async playAnimation(): Promise<void> {
    if (this.container) {
      let animation: Animation;
      if (this.expanded) {
        animation = this.animationService.expand(
          this.container.nativeElement,
          {
            duration: this.animationDuration
          }
        );
      } else {
        animation = this.animationService.collapse(
          this.container.nativeElement,
          {
            duration: this.animationDuration
          }
        );
      }
      await animation.play();
    }
  }

}
