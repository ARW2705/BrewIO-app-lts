/* Module imports */
import { Injectable } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  constructor(public animationCtrl: AnimationController) {}

  slideIn(element: HTMLElement, options: object): Animation {
    return this.animationCtrl.create()
      .addElement(element)
      .duration(options['speed'] || 500)
      .fromTo('transform', `translateX(${ options['direction'] || -100}%)`, 'translateX(0)')
      .fromTo('opacity', 0, 1);
  }

  slideOut(element: HTMLElement, options: object): Animation {
    return this.animationCtrl.create()
      .addElement(element)
      .duration(options['speed'] || 500)
      .fromTo('transform', 'translateX(0)', `translateX(${ options['direction'] || 100}%)`)
      .fromTo('opacity', 1, 0);
  }

  expand(element: HTMLElement): Animation {
    const opacityAnimation = this.animationCtrl.create()
      .duration(150)
      .fromTo('opacity', 0, 1);
    const transformAnimation = this.animationCtrl.create()
      .addElement(element)
      .duration(350)
      .fromTo('transform', 'translateY(-100%)', 'translateY(0%)')
      .fromTo('height', 0, 'auto');

    return this.animationCtrl.create()
      .beforeStyles({ height: 'auto' })
      .afterStyles({ opacity: 1 })
      .addAnimation([opacityAnimation, transformAnimation]);
  }

  collapse(element: HTMLElement): Animation {
    return this.animationCtrl.create()
      .addElement(element)
      .duration(350)
      .afterStyles({ height: 0 })
      .fromTo('transform', 'translateY(0%)', 'translateY(-100%)')
      .fromTo('height', 'auto', 0);
  }
}
