/* Module imports */
import { Component, HostListener } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

/* Service imports */
import { InventoryService } from './services/inventory/inventory.service';
import { LibraryService } from './services/library/library.service';
import { ProcessService } from './services/process/process.service';
import { RecipeService } from './services/recipe/recipe.service';
import { UserService } from './services/user/user.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  /**
   * Inventory, Process, and Recipe services are passed in order to initialize
   * them here. They will be called in sequence starting from user service
   */
  constructor(
    public platform: Platform,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    public inventoryService: InventoryService,
    public libraryService: LibraryService,
    public processService: ProcessService,
    public recipeService: RecipeService,
    public userService: UserService
  ) {
    this.libraryService.fetchAllLibraries();
    this.userService.loadUserFromStorage();
    this.initializeApp();
  }

  /**
   * Listen for platform ready event; dismiss splash screen when ready
   * Note - calling splashscreen hide on platform ready causes white screen after
   * platform ready is emitted, but before displaying home component; currently
   * found a workaround to call hide after all background methods are finish;
   * investigating alternatives
   *
   * @params: none
   * @return: none
   */
  initializeApp(): void {
    this.platform.ready().then(() => {
      console.log('APP READY');
      this.statusBar.styleDefault();
    });
  }

  /**
   * Check if given element is an ion-select interface option
   *
   * @params: elem - the ion-alert to test
   *
   * @return: true if element is not null
   * and has the class 'select-interface-option'
   */
  isSelectOptionChecked(elem: HTMLElement): boolean {
    return elem && elem.classList.contains('select-interface-option');
  }

  /**
   * List for ionAlertDidPresent event; if event is fired by ion-select and has
   * a selected item, scroll to that item
   *
   * @params: none
   * @return: none
   */
  @HostListener('ionAlertDidPresent')
  onAlertOpen() {
    const selectedButton: HTMLElement
      = document.querySelector('[aria-checked="true"]');

    if (this.isSelectOptionChecked(selectedButton)) {
      selectedButton.scrollIntoView();
    }
  }
}
