/* Module imports */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Animation } from '@ionic/angular';

/* Interface imports */
import { Timer, TimerProcess } from '@shared/interfaces';

/* Service imports */
import { AnimationsService } from '@services/animations/animations.service';


@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  @Input() process: TimerProcess;
  @Input() timer: Timer = null;
  @ViewChild('timerControlsContainer', { read: ElementRef }) timerControlsContainer: ElementRef;
  chevronPath: string = '';
  showDescription: boolean = false;

  constructor(public animationService: AnimationsService) { }

  ngOnInit() {
    if (this.timer) {
      this.setChevron();
    }
  }

  /**
   * Set button icon path up or down
   *
   * @params: none
   * @return: none
   */
  setChevron(): void {
    const isUp: boolean = this.timer.show;
    const half: number = 0.5;
    const xMid: number = this.timer.settings.width * half;
    const relativeWidth: number = 0.2;
    const xOffset: number = xMid * relativeWidth;
    const startY: number = 0.75;
    const yEnd: number = this.timer.settings.height * startY;
    const relativeHeight: number = 0.1;
    const yOffset: number = yEnd * relativeHeight;
    this.chevronPath = `
      M ${ xMid - xOffset } ${ yEnd + (isUp ? yOffset : 0) }
      L ${      xMid      } ${ yEnd + (isUp ? 0 : yOffset) }
        ${ xMid + xOffset } ${ yEnd + (isUp ? yOffset : 0) }
    `;
  }

  /**
   * Toggle individual timer controls visibility
   *
   * @param: none
   * @return: none
   */
  toggleShowDescription(): void {
    this.showDescription = !this.showDescription;
  }

  /**
   * Show or hide individual timer controls
   *
   * @params: none
   * @return: none
   */
  async toggleTimerControls(): Promise<void> {
    this.timer.show = !this.timer.show;
    this.setChevron();
    if (this.timerControlsContainer) {
      let animation: Animation;
      if (this.timer.show) {
        animation = this.animationService.expand(this.timerControlsContainer.nativeElement);
      } else {
        animation = this.animationService.collapse(this.timerControlsContainer.nativeElement);
      }
      await animation.play();
    }
  }

}
