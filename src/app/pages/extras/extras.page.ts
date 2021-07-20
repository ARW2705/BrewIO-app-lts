/* Module imports */
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, Navigation } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Utility function imports */
import { toTitleCase } from '../../shared/utility-functions/utilities';

/* Interface imports */
import { Batch, InventoryItem } from '../../shared/interfaces';

/* Animation imports */
import { AnimationsService } from '../../services/animations/animations.service';
import { ErrorReportingService } from '../../services/error-reporting/error-reporting.service';

// For testing purposes only
// import { ConnectionProvider } from '../../providers/connection/connection';

@Component({
  selector: 'page-extras',
  templateUrl: './extras.page.html',
  styleUrls: ['./extras.page.scss']
})
export class ExtrasPage implements OnInit, OnDestroy {
  @ViewChild('aboutContainer') aboutContainer: ElementRef;
  @ViewChild('activeBatchesContainer') activeBatchesContainer: ElementRef;
  @ViewChild('inventoryContainer') inventoryContainer: ElementRef;
  @ViewChild('listContainer') listContainer: ElementRef;
  @ViewChild('preferencesContainer') preferencesContainer: ElementRef;
  @ViewChild('userContainer') userContainer: ElementRef;
  currentIndex: number = -1;
  destroy$: Subject<boolean> = new Subject<boolean>();
  animationDuration: number = 250;
  extras: { title: string, icon: string }[] = [
    {
      title: 'active batches',
      icon: 'flask'
    },
    {
      title: 'inventory',
      icon: 'clipboard'
    },
    {
      title: 'preferences',
      icon: 'options'
    },
    {
      title: 'user',
      icon: 'settings'
    },
    {
      title: 'about',
      icon: 'bulb'
    }
  ];
  onBackClick: () => void;
  optionalInventoryData: Batch | InventoryItem = null;
  title: string = 'More Options';


  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public animationService: AnimationsService,
    public errorReporter: ErrorReportingService
  ) { }

  /***** Lifecycle Hooks *****/

  ngOnInit() {
    console.log('extras page init');
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (): void => {
          const nav: Navigation = this.router.getCurrentNavigation();
          if (nav.extras.state) {
            const options: object = nav.extras.state;
            if (options['passTo'] === 'inventory') {
              this.optionalInventoryData = options['optionalData'];
              this.displayComponent(1, true);
            }
          }
        },
        (error: Error): void => {
          this.errorReporter.setErrorReport(this.errorReporter.getCustomReportFromError(error));
        }
      );
  }

  ngOnDestroy() {
    console.log('extras page destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ionViewWillEnter() {
    console.log('extras page will enter');
    if (!this.optionalInventoryData) {
      this.viewPageRoot();
    }
  }

  /***** End Lifecycle Hooks *****/

  // For testing purposes only
  // toggleConnection(): void {
  //   this.connection.toggleConnection();
  //   console.log(this.connection.isConnected());
  // }

  /**
   * Reset the extras page to view the list
   *
   * @params: none
   * @return: none
   */
  async viewPageRoot(fromIndex: number = -1) {
    if (fromIndex !== -1) {
      try {
        const animation = this.animationService.slideOut(
          this.getContainer(fromIndex),
          {
            duration: this.animationDuration,
            direction: -100
          }
        );
        await animation.play();
      } catch (error) {
        console.log('display extras home error', error);
      }
    }
    this.title = 'More Options';
    this.onBackClick = undefined;
    this.optionalInventoryData = null;
  }

  /**
   * Navigate to component at given index
   *
   * @params: index - index of extras to navigate to
   * @params: passThrough - true if calling a specific component from outside extras and animation
   * should be bypassed; defaults to false
   *
   * @return: none
   */
  async displayComponent(index: number, passThrough: boolean = false): Promise<void> {
    this.title = toTitleCase(this.extras[index].title);
    this.onBackClick = this.viewPageRoot.bind(this, index);
    try {
      if (!passThrough) {
        const animation = this.animationService.slideIn(
          this.getContainer(index),
          {
            duration: this.animationDuration
          }
        );
        await animation.play();
      }
    } catch (error) {
      console.log('display extras error', error);
    }
  }

  /**
   * Get the component container for a given list index
   *
   * @params: index - index of container to retrieve
   *
   * @return: the requested container native element
   */
  getContainer(index: number): HTMLElement {
    switch (index) {
      case 0:
        return this.activeBatchesContainer.nativeElement;
      case 1:
        return this.inventoryContainer.nativeElement;
      case 2:
        return this.preferencesContainer.nativeElement;
      case 3:
        return this.userContainer.nativeElement;
      case 4:
        return this.aboutContainer.nativeElement;
      default:
        return null;
    }
  }

}
