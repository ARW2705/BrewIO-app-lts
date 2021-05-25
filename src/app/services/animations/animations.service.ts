/* Module imports */
import { Injectable } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  constructor(public animationCtrl: AnimationController) {}

  /**
   * Slide in element horizontally
   *
   * @params: element - the HTMLElement to animate
   * @params: [options] - optional overrides
   *
   * @return: configured animation
   */
  slideIn(element: HTMLElement, options?: object): Animation {
    let direction: number = -100;
    let speed: number = 500;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('speed')) {
        speed = options['speed'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(speed)
      .fromTo('transform', `translateX(${direction}%)`, 'translateX(0)')
      .fromTo('opacity', 0, 1);
  }

  /**
   * Slide out element horizontally
   *
   * @params: element - the HTMLElement to animate
   * @params: [options] - optional overrides
   *
   * @return: configured animation
   */
  slideOut(element: HTMLElement, options?: object): Animation {
    let direction: number = 100;
    let speed: number = 500;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('speed')) {
        speed = options['speed'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(speed)
      .fromTo('transform', 'translateX(0)', `translateX(${direction}%)`)
      .fromTo('opacity', 1, 0);
  }

  /**
   * Expand element vertically
   *
   * @params: element - the HTMLElement to animate
   * @params: [options] - optional overrides
   *
   * @return: configured animation
   */
  expand(element: HTMLElement, options?: object): Animation {
    let direction: number = -50;
    let speed: number = 250;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('speed')) {
        speed = options['speed'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(speed)
      .easing('ease-in')
      .fromTo('transform', `translateY(${direction}%)`, 'translateY(0%)')
      .fromTo('height', 0, 'auto')
      .fromTo('opacity', 0, 1);
  }

  /**
   * Collapse element vertically
   *
   * @params: element - the HTMLElement to animate
   * @params: [options] - optional overrides
   *
   * @return: configured animation
   */
  collapse(element: HTMLElement, options?: object): Animation {
    let direction: number = -50;
    let speed: number = 250;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('speed')) {
        speed = options['speed'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(speed)
      .fromTo('transform', 'translateY(0%)', `translateY(${direction}%)`)
      .fromTo('height', 'auto', 0)
      .fromTo('opacity', 1, 0);
  }

}
