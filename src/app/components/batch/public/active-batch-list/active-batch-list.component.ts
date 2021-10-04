/* Module imports */
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Batch } from '../../../../shared/interfaces';

/* Type imports */
import { CustomError } from '../../../../shared/types';

/* Service imports */
import { AnimationsService, ErrorReportingService, IdService, ProcessService, UtilityService } from '../../../../services/services';


@Component({
  selector: 'app-active-batch-list',
  templateUrl: './active-batch-list.component.html',
  styleUrls: ['./active-batch-list.component.scss']
})
export class ActiveBatchListComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() enterDuration: number = 0;
  @Input() rootURL: string = 'tabs/home';
  @Input() shown: boolean = false;
  @ViewChild('batchSlidingItemsList', { read: ElementRef }) batchSlidingItemsList: ElementRef;
  activeBatchesList: Batch[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  topLevelContentContainer: HTMLElement = null;

  constructor(
    public animationService: AnimationsService,
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public processService: ProcessService,
    public renderer: Renderer2,
    public router: Router,
    public utilService: UtilityService
  ) { }

  /***** Lifecycle Hooks *** */

  ngOnInit(): void {
    console.log('active batch component init');
    // retrieve active batches only
    this.processService.getBatchList(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (activeBatchesList$: BehaviorSubject<Batch>[]): void => {
          this.activeBatchesList = this.utilService.getArrayFromSubjects<Batch>(activeBatchesList$);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  ngAfterViewInit(): void {
    if (this.animationService.shouldShowHint('sliding', 'batch')) {
      this.runSlidingHints();
    }
  }

  ngOnChanges(): void {
    try {
      if (this.animationService.shouldShowHint('sliding', 'batch')) {
        this.runSlidingHints();
      }
    } catch (error) {
      // do nothing if too soon
    }
  }

  ngOnDestroy(): void {
    console.log('active batch component destroy');
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  /***** End lifecycle hooks *** */


  /**
   * Navigate to Process Page to continue given batch
   *
   * @param: batch - the batch instance to use in brew process
   *
   * @return: none
   */
  navToBrewProcess(batch: Batch): void {
    this.router.navigate(
      ['tabs/process'],
      {
        state: {
          requestedUserId: batch.owner,
          selectedBatchId: this.idService.getId(batch),
          rootURL: this.rootURL
        }
      }
    );
  }

  /***** Animation *****/

  /**
   * Get the IonContent HTMLElement of the current view
   *
   * @param: none
   *
   * @return: IonContent element or null if list hasn't been initialized
   */
  getTopLevelContainer(): HTMLElement {
    if (!this.batchSlidingItemsList) {
      return null;
    }

    let currentElem: HTMLElement = this.batchSlidingItemsList.nativeElement;
    while (currentElem && currentElem.tagName !== 'ION-CONTENT') {
      currentElem = currentElem.parentElement;
    }

    return currentElem;
  }

  /**
   * Report an animation error when containing element is not found
   *
   * @param: none
   * @return: none
   */
  reportSlidingHintError(): void {
    const message: string = 'Cannot find content container';
    const severity: number = 4;
    this.errorReporter.setErrorReport(
      this.errorReporter.getCustomReportFromError(
        new CustomError('AnimationError', message, severity, message)
      )
    );
  }

  /**
   * Trigger horizontally sliding gesture hint animations
   *
   * @param: none
   * @return: none
   */
  runSlidingHints(): void {
    const topLevelContent: HTMLElement = this.getTopLevelContainer();
    if (!topLevelContent) {
      this.reportSlidingHintError();
      return;
    }

    this.toggleSlidingItemClass(true);

    const listElem: HTMLElement = this.batchSlidingItemsList.nativeElement;
    this.animationService.playCombinedSlidingHintAnimations(
      topLevelContent,
      listElem,
      this.animationService.getEstimatedItemOptionWidth(listElem, 0, 1),
      this.enterDuration
    )
    .pipe(finalize((): void => this.toggleSlidingItemClass(false)))
    .subscribe(
      (): void => this.animationService.setHintShownFlag('sliding', 'batch'),
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @param: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   *
   * @return: none
   */
  toggleSlidingItemClass(show: boolean): void {
    const listElem: HTMLElement = this.batchSlidingItemsList.nativeElement;
    this.animationService.toggleSlidingItemClass(listElem, show, this.renderer);
  }

  /***** End Animation *****/

}
