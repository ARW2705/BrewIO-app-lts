export interface ToastButton {
  role?: string;
  icon?: string;
  side?: string;
  text: string;
  handler(): any;
}
