/* Module Imports */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface Imports */
import { User } from '@shared/interfaces';

/* Service Imports */
import { UserService } from '@services/public';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() overrideBackButton?: () => void;
  @Input() overrideTitlecase?: boolean = false;
  @Input() rootURL?: string;
  @Input() shouldHideLoginButton: boolean = false;
  @Input() title: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoggedIn: boolean = false;
  user: User = null;

  constructor(
    public router: Router,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((_user: User): void => {
        this.user = _user;
        this.isLoggedIn = this.userService.isLoggedIn();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /**
   * Handle header back button; Navigate to given root URL or use override function if present
   *
   * @param: none
   * @return: none
   */
  goBack(): void {
    if (this.overrideBackButton) {
      this.overrideBackButton();
    } else if (this.rootURL) {
      this.router.navigate([this.rootURL]);
    }
  }

}
