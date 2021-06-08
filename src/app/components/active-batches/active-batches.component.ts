/* Module imports */
import { Component, OnDestroy, Input, OnInit, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';

/* Utility function imports */
import { getId } from '../../shared/utility-functions/id-helpers';
import { getArrayFromSubjects } from '../../shared/utility-functions/subject-helpers';

/* Service imports */
import { AnimationsService } from '../../services/animations/animations.service';
import { ProcessService } from '../../services/process/process.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'active-batches',
  templateUrl: './active-batches.component.html',
  styleUrls: ['./active-batches.component.scss']
})
export class ActiveBatchesComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() enterDuration: number = 0;
  @Input() rootURL: string = 'tabs/home';
  @ViewChild('batchSlidingItemsList', { read: ElementRef }) batchSlidingItemsList: ElementRef;
  activeBatchesList: Batch[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public renderer: Renderer2,
    public router: Router,
    public animationService: AnimationsService,
    public processService: ProcessService,
    public toastService: ToastService
  ) { }

  /***** Lifecycle Hooks *** */

  ngOnInit(): void {
    console.log('active batch component init');
    // retrieve active batches only
    this.processService.getBatchList(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (activeBatchesList$: BehaviorSubject<Batch>[]): void => {
          this.activeBatchesList = getArrayFromSubjects<Batch>(activeBatchesList$);
        },
        (error: string): void => {
          console.log('Batch list error', error);
          this.toastService.presentErrorToast('Error loading batch list');
        }
      );
  }

  ngAfterViewInit(): void {
    if (!this.animationService.hasHintBeenShown('sliding', 'batch')) {
      this.runSlidingHints();
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
   * @params: batch - the batch instance to use in brew process
   *
   * @return: none
   */
  navToBrewProcess(batch: Batch): void {
    this.router.navigate(
      ['tabs/process'],
      {
        state: {
          requestedUserId: batch.owner,
          selectedBatchId: getId(batch),
          rootURL: this.rootURL
        }
      }
    );
  }

  /***** Animation *****/

  /**
   * Get the IonContent HTMLElement of the current view
   *
   * @params: none
   *
   * @return: IonContent element
   */
  getTopLevelContainer(): HTMLElement {
    let currentElem: HTMLElement = this.batchSlidingItemsList.nativeElement;
    while (currentElem && currentElem.tagName !== 'ION-CONTENT') {
      currentElem = currentElem.parentElement;
    }
    return currentElem;
  }

  /**
   * Trigger horizontally sliding gesture hint animations
   *
   * @params: none
   * @return: none
   */
  runSlidingHints(): void {
    const topLevelContent: HTMLElement = this.getTopLevelContainer();
    if (!topLevelContent) {
      console.log('Animation error: cannot find content container');
      return;
    }

    this.toggleSlidingItemClass(true);

    this.animationService.playCombinedSlidingHintAnimations(
      topLevelContent,
      this.batchSlidingItemsList.nativeElement,
      this.enterDuration
    )
    .pipe(finalize((): void => this.toggleSlidingItemClass(false)))
    .subscribe(
      (): void => this.animationService.setHintShownFlag('sliding', 'batch'),
      (error: string): void => console.log('Animation error', error)
    );
  }

  /**
   * Toggle classes on IonItemSliding for hint animations;
   * This will show the IonOptions underneath the IonItem
   *
   * @params: show - true if classes should be added prior to animation; false to remove classes
   *  after animations have completed
   *
   * @return: none
   */
  toggleSlidingItemClass(show: boolean): void {
    this.animationService.toggleSlidingItemClass(
      this.batchSlidingItemsList.nativeElement,
      show,
      this.renderer
    );
  }

  /***** End Animation *****/

}
