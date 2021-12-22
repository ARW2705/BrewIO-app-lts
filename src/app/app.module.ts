/* Module imports */
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

/* App Modules */
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* Component Modules */
import { ErrorReportComponentModule } from './components/system/public/error-report/error-report.module';

/* Services */
import {
  ActionSheetService,
  AnimationsService,
  AuthorizeInterceptor,
  BackgroundModeService,
  CalculationsService,
  CalendarService,
  ClientErrorService,
  ConnectionService,
  DeviceService,
  ErrorInterceptor,
  ErrorReportingService,
  EventService,
  FileService,
  FormAttributeService,
  FormValidationService,
  HttpErrorService,
  IdService,
  ImageService,
  InventoryService,
  LibraryService,
  LocalNotificationService,
  LoggingService,
  ModalService,
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
    ErrorReportComponentModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot({
      scrollAssist: false,
      scrollPadding: false
    }),
    IonicStorageModule.forRoot(),
    ReactiveFormsModule
  ],
  providers: [
    { provide: ErrorHandler, useClass: ClientErrorService },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizeInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ActionSheetService,
    AnimationsService,
    BackgroundMode,
    BackgroundModeService,
    CalculationsService,
    CalendarService,
    Camera,
    ConnectionService,
    Crop,
    Device,
    DeviceService,
    ErrorReportingService,
    EventService,
    File,
    FilePath,
    FileService,
    FormAttributeService,
    FormValidationService,
    HttpErrorService,
    IdService,
    ImageResizer,
    ImageService,
    InventoryService,
    LibraryService,
    LocalNotifications,
    LocalNotificationService,
    LoggingService,
    ModalService,
    PreferencesService,
    ProcessService,
    RecipeService,
    StatusBar,
    SplashScreen,
    StorageService,
    SyncService,
    TimerService,
    ToastService,
    TypeGuardService,
    UserService,
    UtilityService,
    Network,
    WebView,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
