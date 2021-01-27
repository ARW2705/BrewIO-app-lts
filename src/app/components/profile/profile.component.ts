/* Module imports */
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonInput } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Page imports */
import { User } from '../../shared/interfaces/user';

/* Service imports */
import { UserService } from '../../services/user/user.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('email') emailField: IonInput;
  @ViewChild('firstname') firstnameField: IonInput;
  @ViewChild('lastname') lastnameField: IonInput;
  destroy$: Subject<boolean> = new Subject<boolean>();
  editing: string = '';
  isLoggedIn: boolean = false;
  user: User = null;
  userForm: FormGroup = null;

  constructor(
    public cdRef: ChangeDetectorRef,
    public formBuilder: FormBuilder,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('profile component init');
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (user: User): void => {
          this.user = user;
          this.isLoggedIn = this.userService.isLoggedIn();
          this.initForm(user);
        },
        (error: string): void => {
          console.log(`Error getting user: ${error}`);
          this.toastService.presentErrorToast('Error getting profile');
        }
      );
  }

  ngOnDestroy() {
    console.log('profile component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Select field to be edited
   *
   * @params: field - the form control field to edit
   * @params: update - new text to be applied
   *
   * @return: none
   */
  changeEdit(field: string, update: IonInput): void {
    this.editing = update === undefined ? field : '';
    if (update === undefined) {
      this.cdRef.detectChanges();
      if (field === 'email') {
        this.emailField.setFocus();
      } else if (field === 'firstname') {
        this.firstnameField.setFocus();
      } else if (field === 'lastname') {
        this.lastnameField.setFocus();
      }
    }
  }

  /**
   * Create form with profile values in form fields
   *
   * @params: user - user profile object
   *
   * @return: none
   */
  initForm(user: User): void {
    this.userForm = this.formBuilder.group({
      email: [
        (user && user.email ? user.email : ''),
        [Validators.email, Validators.required]
      ],
      firstname: [
        (user && user.firstname ? user.firstname : ''),
        [Validators.maxLength(25)]
      ],
      lastname: [
        (user && user.lastname ? user.lastname : ''),
        [Validators.maxLength(25)]
      ]
    });
  }

  /**
   * Check if given field is being edited
   *
   * @params: field - form field to check
   *
   * @return: true if given field matches the currently editing field
   */
  isEditing(field: string): boolean {
    return field === this.editing;
  }

  /**
   * Submit updated user profile, update view on successful response or
   * display error message on error
   *
   * @params: none
   * @return: none
   */
  onUpdate(): void {
    this.userService.updateUserProfile(this.userForm.value)
      .subscribe(
        (): void => {
          this.toastService.presentToast('Profile Updated');
        },
        (error: string): void => {
          console.log('profile update error', error);
          this.toastService.presentToast('Error updating profile');
        }
      );
  }

  /***** End Form Methods *****/

}
