/* Module imports */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Camera } from '@ionic-native/camera/ngx';
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
import { PipesModule } from './pipes/pipes.module';

/* Services */
import { ActionSheetService } from './services/action-sheet/action-sheet.service';
import { AnimationsService } from './services/animations/animations.service';
import { AuthorizedInterceptor, UnauthorizedInterceptor } from './services/interceptor/interceptor.service';
import { BackgroundModeService } from './services/background-mode/background-mode.service';
import { CalculationsService } from './services/calculations/calculations.service';
import { ClientIdService } from './services/client-id/client-id.service';
import { ConnectionService } from './services/connection/connection.service';
import { EventService } from './services/event/event.service';
import { FormValidationService } from './services/form-validation/form-validation.service';
import { InventoryService } from './services/inventory/inventory.service';
import { LibraryService } from './services/library/library.service';
import { LocalNotificationService } from './services/local-notification/local-notification.service';
import { PreferencesService } from './services/preferences/preferences.service';
import { HttpErrorService } from './services/http-error/http-error.service';
import { ProcessService } from './services/process/process.service';
import { RecipeService } from './services/recipe/recipe.service';
import { StorageService } from './services/storage/storage.service';
import { SyncService } from './services/sync/sync.service';
import { TimerService } from './services/timer/timer.service';
import { ToastService } from './services/toast/toast.service';
import { UserService } from './services/user/user.service';

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
    IonicStorageModule.forRoot(),
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    Camera,
    Crop,
    File,
    FilePath,
    ImageResizer,
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
    ClientIdService,
    ConnectionService,
    EventService,
    FormValidationService,
    InventoryService,
    LibraryService,
    LocalNotificationService,
    PreferencesService,
    HttpErrorService,
    ProcessService,
    RecipeService,
    StorageService,
    SyncService,
    TimerService,
    ToastService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizedInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true
    }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
