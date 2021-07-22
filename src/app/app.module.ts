/* Module imports */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Device } from '@ionic-native/device/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';

/* App Modules */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* Services */
import {
  ActionSheetService,
  AnimationsService,
  AuthorizeInterceptor,
  BackgroundModeService,
  CalculationsService,
  ClientErrorService,
  ConnectionService,
  DeviceService,
  ErrorInterceptor,
  ErrorReportingService,
  EventService,
  FileService,
  FormValidationService,
  HttpErrorService,
  IdService,
  ImageService,
  InventoryService,
  LibraryService,
  LocalNotificationService,
  LoggingService,
  PreferencesService,
  ProcessService,
  RecipeService,
  StorageService,
  SyncService,
  TimerService,
  ToastService,
  TypeGuardService,
  UserService,
  UtilityService
} from './services/services';


@NgModule({
  declarations: [ AppComponent ],
  entryComponents: [],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    IonicModule.forRoot({
      scrollAssist: false,
      scrollPadding: false
    }),
    IonicStorageModule.forRoot()
  ],
  providers: [
    Camera,
    Crop,
    Device,
    File,
    FilePath,
    ImageResizer,
    ImageService,
    LocalNotifications,
    StatusBar,
    SplashScreen,
    BackgroundMode,
    Network,
    WebView,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ActionSheetService,
    AnimationsService,
    BackgroundModeService,
    CalculationsService,
    IdService,
    ConnectionService,
    DeviceService,
    { provide: ErrorHandler, useClass: ClientErrorService },
    ErrorReportingService,
    EventService,
    FileService,
    FormValidationService,
    InventoryService,
    LibraryService,
    LocalNotificationService,
    LoggingService,
    PreferencesService,
    HttpErrorService,
    ProcessService,
    RecipeService,
    StorageService,
    SyncService,
    TimerService,
    ToastService,
    TypeGuardService,
    UserService,
    UtilityService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizeInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
