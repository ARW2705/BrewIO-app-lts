/* Module imports */
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { User } from '../../shared/interfaces/user';

/* Provider imports */
import { EventService } from '../../services/event/event.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'page-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;
  destroy$: Subject<boolean> = new Subject<boolean>();
  firstActiveBatchesLoad: boolean = true;
  firstInventoryLoad: boolean = true;
  isLoggedIn: boolean = false;
  notifications: string[] = [];
  showActiveBatches: boolean = false;
  showInventory: boolean = false;
  user: User = null;
  welcomeMessage: string = '';

  constructor(
    public event: EventService,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('home page init');
    this.registerEventListeners();
    this.listenForUserChanges();
  }

  ngOnDestroy() {
    console.log('home page destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
    this.event.unregister('scroll-in-sub-component');
  }

  /***** End lifecycle hooks *****/

  /**
   * List for changes in user
   *
   * @params: none
   * @return: none
   */
  listenForUserChanges(): void {
    this.userService
      .getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (user: User): void => {
          this.user = user;
          this.isLoggedIn = this.userService.isLoggedIn();
          this.setWelcomeMessage();
        },
        (error: string): void => this.toastService.presentErrorToast(error)
      );
  }

  /**
   * Register event listener for scrolling in sub component;
   * On scroll event, scroll to given landmark
   *
   * @params: none
   * @return: none
   */
  registerEventListeners(): void {
    this.event.register('scroll-in-sub-component')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: object): void => {
        if (data['subComponent'] === 'inventory' && data['offset']) {
          const scrollElement: HTMLElement
            = document.querySelector('#inventory-scroll-landmark');
          if (scrollElement) {
            this.ionContent.scrollToPoint(
              0,
              scrollElement.offsetTop + data['offset'] + 150,
              1000
            );
          }
        }
      });
  }

  /**
   * Scroll to a landmark on the parent page
   *
   * @params: idName - the name of the id landmark
   *
   * @return: none
   */
  scrollToId(idName: string): void {
    const accordionElement: HTMLElement
      = document.querySelector(`#${idName}`);
    if (accordionElement) {
      this.ionContent.scrollToPoint(0, accordionElement.offsetTop, 1000);
    }
  }

  /**
   * Format welcome message
   *
   * @params: none
   *
   * @return: welcome message string
   */
  setWelcomeMessage(): void {
    let userName: string = ' ';
    if (this.user) {
      if (this.user.firstname) {
        userName = ` ${this.user.firstname} `;
      } else if (this.user.username) {
        userName = ` ${this.user.username} `;
      }
    }
    this.welcomeMessage = `Welcome${userName}to BrewIO`;
  }

  /**
   * Toggle active batch list expansion
   *
   * @params: none
   * @return: none
   */
  toggleActiveBatches(): void {
    this.showActiveBatches = !this.showActiveBatches;
    if (this.showActiveBatches) {
      this.firstActiveBatchesLoad = false;
      this.scrollToId('batch-scroll-landmark');
    }
  }

  /**
   * Toggle inventory list expansion
   *
   * @params: none
   * @return: none
   */
  toggleInventory(): void {
    this.showInventory = !this.showInventory;
    if (this.showInventory) {
      this.firstInventoryLoad = false;
      this.scrollToId('inventory-scroll-landmark');
    }
  }

}
