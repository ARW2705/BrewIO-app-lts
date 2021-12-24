/* Module imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Service imports */
import { UserService } from '@services/user/user.service';


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

  ngOnInit(): void {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((): void => { this.isLoggedIn = this.userService.isLoggedIn(); });
  }

  ngOnDestroy(): void {
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
