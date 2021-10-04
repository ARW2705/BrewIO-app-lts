/* Module imports */
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

/* Interface imports */
import { User } from '../../src/app/shared/interfaces';

/* Component imports */
import { HeaderComponent } from '../../src/app/components/shared/header/header.component';

@Component({
  selector: 'app-header',
  template: '',
  providers: [
    { provide: HeaderComponent, useClass: HeaderComponentStub }
  ]
})
export class HeaderComponentStub {
  @Input() overrideBackButton?: () => void;
  @Input() rootURL?: string;
  @Input() shouldHideLoginButton: boolean = false;
  @Input() title: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoggedIn: boolean = false;
  user: User = null;
}
