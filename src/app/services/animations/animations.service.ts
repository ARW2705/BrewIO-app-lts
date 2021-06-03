/* Module imports */
import { Injectable } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class AnimationsService {
  hintFlags: { [gestureType: string]: { [componentType: string]: boolean } } = {
    sliding: {
      recipe: false,
      recipeDetail: false,
      inventory: false
    }
  };

  constructor(public animationCtrl: AnimationController) {}

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
    let duration: number = 250;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('duration')) {
        duration = options['duration'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(duration)
      .fromTo('transform', 'translateY(0%)', `translateY(${direction}%)`)
      .fromTo('height', 'auto', 0)
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
    let duration: number = 250;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('duration')) {
        duration = options['duration'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(duration)
      .easing('ease-in')
      .fromTo('transform', `translateY(${direction}%)`, 'translateY(0%)')
      .fromTo('height', 0, 'auto')
      .fromTo('opacity', 0, 1);
  }

  /**
   * Check if a given gesture hint has been shown on a given component type
   *
   * @params: gestureType - the type of gesture animation (e.g. 'sliding', 'tapping')
   * @params: componentType - the type of component using the gesture hint
   *
   * @return: true if a given gesture hint has been played on the component
   */
  hasHintBeenShown(gestureType: string, componentType: string): boolean {
    try {
      return this.hintFlags[gestureType][componentType];
    } catch (error) {
      console.log('Error getting hint show flag', gestureType, componentType, error);
      return false;
    }
  }

  /**
   * Flag a component as having shown a gesture hint
   *
   * @params: gestureType - the type of gesture animation (e.g. 'sliding', 'tapping')
   * @params: componentType - the type of component using the gesture hint
   *
   * @return: none
   */
  setHintShownFlag(gestureType: string, componentType: string): void {
    try {
      this.hintFlags[gestureType][componentType] = true;
    } catch (error) {
      console.log('Error setting hint show flag', gestureType, componentType, error);
    }
  }

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
    let duration: number = 500;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('duration')) {
        duration = options['duration'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(duration)
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
    let duration: number = 500;

    if (options) {
      if (options.hasOwnProperty('direction')) {
        direction = options['direction'];
      }
      if (options.hasOwnProperty('duration')) {
        duration = options['duration'];
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(duration)
      .fromTo('transform', 'translateX(0)', `translateX(${direction}%)`)
      .fromTo('opacity', 1, 0);
  }

  /**
   * Gesture hint animation for horizontally sliding items
   *
   * @params: element - the HTMLElement to animate
   * @params: [options] - optional overrides
   *
   * @return: configured animation
   */
  slidingHint(element: HTMLElement, options?: object): Animation {
    let duration: number = 1000;
    let delay: number = 0;
    let distance: number = 50;
    let firstBounce: number = 13;
    let secondBounce: number = 3;

    if (options) {
      if (options.hasOwnProperty('duration')) {
        duration = options['duration'];
      }
      if (options.hasOwnProperty('delay')) {
        delay = options['delay'];
      }
      if (options.hasOwnProperty('distance') && options['distance'] > 0) {
        distance = options['distance'];
        firstBounce = distance / 4;
        secondBounce = distance / 20;
      }
    }

    return this.animationCtrl.create()
      .addElement(element)
      .duration(duration)
      .delay(delay)
      .easing('ease-out')
      .keyframes([
        { offset: 0,    transform: 'translateX(0)'                  },
        { offset: 0.2,  transform: `translateX(-${distance}px)`     },
        { offset: 0.25, transform: `translateX(-${distance}px)`     },
        { offset: 0.55, transform: 'translateX(0)'                  },
        { offset: 0.65, transform: `translateX(-${firstBounce}px)`  },
        { offset: 0.68, transform: `translateX(-${firstBounce}px)`  },
        { offset: 0.85, transform: 'translateX(0)'                  },
        { offset: 0.90, transform: `translateX(-${secondBounce}px)` },
        { offset: 0.91, transform: `translateX(-${secondBounce}px)` },
        { offset: 1,    transform: 'translateX(0)'                  }
      ]);
  }

}
