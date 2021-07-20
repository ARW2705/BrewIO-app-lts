/* Module imports */
import { Injectable, Renderer2 } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';
import { Observable, Observer, forkJoin, throwError } from 'rxjs';


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
   * @param: element - the HTMLElement to animate
   * @param: [options] - optional overrides
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
   * @param: element - the HTMLElement to animate
   * @param: [options] - optional overrides
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
   * @param: gestureType - the type of gesture animation (e.g. 'sliding', 'tapping')
   * @param: componentType - the type of component using the gesture hint
   *
   * @return: true if a given gesture hint has been played on the component
   */
  shouldShowHint(gestureType: string, componentType: string): boolean {
    try {
      return !this.hintFlags[gestureType][componentType];
    } catch (error) {
      console.log('Error getting hint show flag', gestureType, componentType, error);
      return true;
    }
  }

  /**
   * Flag a component as having shown a gesture hint
   *
   * @param: gestureType - the type of gesture animation (e.g. 'sliding', 'tapping')
   * @param: componentType - the type of component using the gesture hint
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
   * @param: element - the HTMLElement to animate
   * @param: [options] - optional overrides
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
   * @param: element - the HTMLElement to animate
   * @param: [options] - optional overrides
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
   * @param: element - the HTMLElement to animate
   * @param: [options] - optional overrides
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
   * @param: containerElement - the current view content container
   * @param: sampleElement - an example of one of the items to get a dividing height
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
   * Estimate the width of the right side ion-item-option buttons
   * Note: styling for these elements are not available when creating an animation related to them,
   * this is why the width is estimated by its content instead
   *
   * @param: slidingElement - parent ion-item-sliding element
   * @param: startIndex - the first index of the first ion-item-options on the right side
   * @param: count - the number of options on the right side
   *
   * @return: estimated combined width of all right side ion-item-option s
   */
  getEstimatedItemOptionWidth(slidingElement: HTMLElement, startIndex: number, count: number): number {
    return (count * 20) + Array
      .from(slidingElement.querySelectorAll('ion-item-option'))
      .reduce((acc: number, curr: Node, index: number): number => {
        if (index >= startIndex && index < startIndex + count) {
          return acc + ((<HTMLElement>curr).textContent.length * 9);
        }
        return acc;
      }, 0);
  }

  /**
   * Get the sliding HTMLElements to be animated
   *
   * @param: containerElement - the current view content container
   * @param: parentElement - the sliding elements parent container
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
   * @param: elements - the elements to animate
   * @param: slideDistance - distance to move element in pixels
   * @param: offsetDelay - additional animation delay
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
   * @param: animations - animations group to prepare
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
   * @param: containerElement - the current view content container
   * @param: parentElement - the sliding elements parent container
   * @param: offsetDelay - additional animation delay; defaults to 0
   *
   * @return: observable of array of animation executions
   */
  playCombinedSlidingHintAnimations(
    containerElement: HTMLElement,
    parentElement: HTMLElement,
    slideDistance: number = 0,
    offsetDelay: number = 0
  ): Observable<null[]> {
    console.log('sliding distance', slideDistance);
    let animationQueue: Observable<null>[];
    try {
      const slidingElements: HTMLElement[] = this.getSlidingElements(containerElement, parentElement);
      const animations: Animation[] = this.getSlidingHintAnimations(
        slidingElements,
        slideDistance || containerElement.clientWidth / 4,
        offsetDelay
      );
      animationQueue = this.queueAnimations(animations);
    } catch (error) {
      return throwError(error);
    }

    return forkJoin(animationQueue);
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @param: parentElement - the parent IonItemSliding element
   * @param: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   * @param: renderer - Renderer2 instance from requesting component to perform the class manipulation
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
