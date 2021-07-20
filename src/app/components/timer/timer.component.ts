/* Module imports */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Animation } from '@ionic/angular';

/* Interface imports */
import { Timer } from '../../shared/interfaces';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';


@Component({
  selector: 'timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  @Input() isConcurrent: boolean = false;
  @Input() onTimerAction: (actionName: string, timer: Timer) => void;
  @Input() timer: Timer = null;
  @Input() showDescription: boolean = false;
  @ViewChild('timerControlsContainer', { read: ElementRef }) timerControlsContainer: ElementRef;
  chevronPath: string = '';

  constructor(public animationService: AnimationsService) { }

  ngOnInit() {
    if (this.timer) {
      this.setChevron();
    }
  }

  /**
   * Add a minute to the timer
   *
   * @params: none
   * @return: none
   */
  addToSingleTimer(): void {
    this.onTimerAction('addToSingleTimer', this.timer);
  }

  /**
   * Reset the timer
   *
   * @params: none
   * @return: none
   */
  resetSingleTimer(): void {
    this.onTimerAction('resetSingleTimer', this.timer);
  }

  /**
   * Start the timer
   *
   * @params: none
   * @return: none
   */
  startSingleTimer(): void {
    this.onTimerAction('startSingleTimer', this.timer);
  }

  /**
   * Stop the timer
   *
   * @params: none
   * @return: none
   */
  stopSingleTimer(): void {
    this.onTimerAction('stopSingleTimer', this.timer);
  }

  /**
   * Set button icon path up or down
   *
   * @params: none
   * @return: none
   */
  setChevron(): void {
    const isUp: boolean = this.timer.show;
    const xMid: number = this.timer.settings.width / 2;
    const xOffset: number = xMid * 0.2;
    const yEnd: number = this.timer.settings.height * 0.75;
    const yOffset: number = yEnd * 0.1;
    this.chevronPath = `
      M${xMid - xOffset} ${yEnd + (isUp ? yOffset : 0)}
      L${xMid} ${yEnd + (isUp ? 0 : yOffset)}
       ${xMid + xOffset} ${yEnd + (isUp ? yOffset : 0)}
    `;
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
        animation = this.animationService.expand(this.timerControlsContainer.nativeElement, { direction: -20 });
      } else {
        animation = this.animationService.collapse(this.timerControlsContainer.nativeElement, { direction: -20 });
      }
      await animation.play();
    }
  }

}
