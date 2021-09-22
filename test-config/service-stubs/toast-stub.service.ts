import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastServiceStub {
  public presentToast(...options) {}
  public presentErrorToast(...options) {}
}
