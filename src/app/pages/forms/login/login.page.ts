/* Module imports */
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/* Interface imports */
import { User } from '../../../shared/interfaces/user';

/* Service imports */
import { ToastService } from '../../../services/toast/toast.service';
import { UserService } from '../../../services/user/user.service';


@Component({
  selector: 'page-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  @Input() rootURL: string = '';
  loginForm: FormGroup = null;
  showPassword: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public toastService: ToastService,
    public userService: UserService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    this.initForm();
  }

  /***** End Lifecycle Hooks *****/


  /***** Form Methods *****/

  /**
   * Call ModalController dismiss method
   *
   * @params: none
   * @return: none
   */
  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  /**
   * Create the form
   *
   * @params: none
   * @return: none
   */
  initForm(): void {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required],
      remember: false,
      username: ['', Validators.required]
    });
  }

  /**
   * Submit log in form and provide feedback toast on response
   *
   * @params: none
   * @return: none
   */
  onSubmit(): void {
    this.userService.logIn(this.loginForm.value, false)
      .subscribe(
        (user: User): void => {
          this.toastService.presentToast(
            `Welcome ${user.username}!`,
            2000,
            'middle',
            'toast-bright'
          );
          this.modalCtrl.dismiss(user);
        },
        (error: string): void => this.toastService.presentErrorToast(error)
      );
  }

  /**
   * Toggle whether password is in plain text or hidden
   *
   * @params: none
   * @return: none
   */
  togglePasswordVisible(): void {
    this.showPassword = !this.showPassword;
  }

  /***** End Form Methods *****/

}
