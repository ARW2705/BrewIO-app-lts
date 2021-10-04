/* Module imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Page imports */
import { LoginPage } from '../../../../pages/forms/login/login.page';
import { SignupPage } from '../../../../pages/forms/signup/signup.page';

/* Service imports */
import { UserService } from '../../../../services/user/user.service';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  expandedContent: string = '';
  isLoggedIn: boolean = false;

  constructor(
    public userService: UserService,
    public modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log('user component init');
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => {
        this.isLoggedIn = this.userService.isLoggedIn();
      });
  }

  ngOnDestroy() {
    console.log('user component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Log out the user
   *
   * @params: none
   * @return: none
   */
  logOut(): void {
    this.userService.logOut();
  }

  /**
   * Open login form modal
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
   * Open sign up form modal
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

  /**
   * Toggle section expansion
   *
   * @params: section - name of section to toggle
   *
   * @return: none
   */
  toggleExpandContent(section: string): void {
    this.expandedContent = this.expandedContent === section ? '' : section;
  }

}
