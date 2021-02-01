/* Module Imports */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface Imports */
import { User } from '../../shared/interfaces/user';

/* Page imports */
import { LoginPage } from '../../pages/forms/login/login.page';
import { SignupPage } from '../../pages/forms/signup/signup.page';

/* Service Imports */
import { ActionSheetService } from '../../services/action-sheet/action-sheet.service';
import { UserService } from '../../services/user/user.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() overrideBackButton?: () => void;
  @Input() rootURL?: string;
  @Input() title: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoggedIn: boolean = false;
  user: User = null;

  constructor(
    public actionService: ActionSheetService,
    public modalCtrl: ModalController,
    public router: Router,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *** */

  ngOnInit(): void {
    console.log('header component init');
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((_user: User): void => {
        this.user = _user;
        this.isLoggedIn = this.userService.isLoggedIn();
      });
  }

  ngOnDestroy(): void {
    console.log('header component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End lifecycle hooks *** */


  /***** Modals *** */

  /**
   * Open login modal
   *
   * @params: none
   * @return: none
   */
  async openLogin(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: LoginPage
    });
    return await modal.present();
  }

  /**
   * Open signup modal
   *
   * @params: none
   * @return: none
   */
  async openSignup(): Promise<void> {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: SignupPage
    });
    return await modal.present();
  }

  /***** End Modals *** */


  /***** Button Hanlders *****/

  /**
   * Handle header back button. Navigate to given root URL
   * or use override function if present
   *
   * @params: none
   * @return: none
   */
  goBack(): void {
    if (this.overrideBackButton) {
      this.overrideBackButton();
    } else if (this.rootURL) {
      this.router.navigate([this.rootURL]);
    }
  }

  /**
   * Action sheet to choose login or signup modal
   *
   * @params: none
   * @return: none
   */
  openLoginSignup(): void {
    this.actionService.openActionSheet(
      'Log In or Sign Up',
      [
        {
          text: 'Log In',
          handler: () => {
            this.openLogin();
          }
        },
        {
          text: 'Sign Up',
          handler: () => {
            this.openSignup();
          }
        }
      ]
    );
  }

  /***** End Button Hanlders *****/

}
