/* Module imports */
import { Injectable, Renderer2 } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';
import { Observable, Observer, forkJoin } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AnimationsService {
  hintFlags: { [gestureType: string]: { [componentType: string]: boolean } } = {
    sliding: {
      recipe: false,
      recipeDetail: false,
      inventory: false,
      batch: false
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

  /***** End Animations *****/


  /***** HTML Element Helpers *****/

  /**
   * Get a count of how many items are currently in view
   *
   * @params: containerElement - the current view content container
   * @params: sampleElement - an example of one of the items to get a dividing height
   *
   * @return: an estimated number of items in view (rounded up)
   */
  getAboveFoldCount(containerElement: HTMLElement, sampleElement: HTMLElement): number {
    try {
      const contentHeight: number = containerElement.clientHeight;
      const itemHeight: number = sampleElement.clientHeight;
      return Math.ceil(contentHeight / itemHeight);
    } catch (error) {
      console.log('Error getting content height', error);
      return -1;
    }
  }

  /**
   * Get the sliding HTMLElements to be animated
   *
   * @params: containerElement - the current view content container
   * @params: parentElement - the sliding elements parent container
   *
   * @return: array of sliding HTMLElements
   */
  getSlidingElements(containerElement: HTMLElement, parentElement: HTMLElement): HTMLElement[] {
    const ionItems: NodeList = parentElement.querySelectorAll('[data-sliding-item]');
    const ionItemElems: HTMLElement[] = Array
      .from(ionItems)
      .map((node: Node): HTMLElement => <HTMLElement>node);
    let showCount: number = this.getAboveFoldCount(containerElement, ionItemElems[0]);

    if (showCount === -1) {
      showCount = ionItems.length / 2;
    }

    return ionItemElems.filter((_: any, index: number): boolean => index < showCount);
  }

  /**
   * Get sliding element hint animations
   *
   * @params: elements - the elements to animate
   * @params: slideDistance - distance to move element in pixels
   * @params: offsetDelay - additional animation delay
   *
   * @return: array sliding hint animations
   */
  getSlidingHintAnimations(
    elements: HTMLElement[],
    slideDistance: number,
    offsetDelay: number
  ): Animation[] {
    const interElementDelay: number = 100;
    return elements
      .map((element: HTMLElement, index: number): Animation => {
        return this.slidingHint(
          element,
          {
            delay: interElementDelay * index + offsetDelay,
            distance: slideDistance
          }
        );
      });
  }

  /**
   * Queue animations and set up animation clean up handling
   *
   * Note: animations must each be destroyed after completion to avoid
   * built-in styles from being affected
   *
   * @params: animations - animations group to prepare
   *
   * @return: array of animation executions as observables
   */
  queueAnimations(animations: Animation[]): Observable<null>[] {
    return animations.map((animation: Animation): Observable<null> => {
      return new Observable((observer: Observer<null>) => {
        animation.onFinish((): void => {
          animation.destroy();
          observer.next(null);
          observer.complete();
        });
        animation.play();
      });
    });
  }

  /**
   * Build and play horizontal sliding hint animations for a group of sliding elements
   *
   * @params: containerElement - the current view content container
   * @params: parentElement - the sliding elements parent container
   * @params: offsetDelay - additional animation delay; defaults to 0
   *
   * @return: observable of array of animation executions
   */
  playCombinedSlidingHintAnimations(
    containerElement: HTMLElement,
    parentElement: HTMLElement,
    offsetDelay: number = 0
  ): Observable<null[]> {
    const slidingElements: HTMLElement[] = this.getSlidingElements(containerElement, parentElement);
    const animations: Animation[] = this.getSlidingHintAnimations(
      slidingElements,
      containerElement.clientWidth / 5,
      offsetDelay
    );
    const animationQueue: Observable<null>[] = this.queueAnimations(animations);

    return forkJoin(animationQueue);
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @params: parentElement - the parent IonItemSliding element
   * @params: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   * @params: renderer - Renderer2 instance from requesting component to perform the class manipulation
   *
   * @return: none
   */
  toggleSlidingItemClass(parentElement: HTMLElement, show: boolean, renderer: Renderer2): void {
    const items: NodeList = parentElement.querySelectorAll('ion-item-sliding');

    Array.from(items).forEach(
      (node: Node): void => {
        if (show) {
          renderer.addClass(node, 'item-sliding-active-slide');
          renderer.addClass(node, 'item-sliding-active-options-end');
        } else {
          renderer.removeClass(node, 'item-sliding-active-slide');
          renderer.removeClass(node, 'item-sliding-active-options-end');
        }
      }
    );
  }

  /***** End HTML Element Helpers *****/

}
