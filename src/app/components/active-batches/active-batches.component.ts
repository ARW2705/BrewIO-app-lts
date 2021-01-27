/* Module imports */
import { Component, OnDestroy, Input, OnInit, ViewChildren } from '@angular/core';
import { IonList } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Interface imports */
import { Batch } from '../../shared/interfaces/batch';

/* Utility function imports */
import { getId } from '../../shared/utility-functions/id-helpers';
import { getArrayFromObservables } from '../../shared/utility-functions/observable-helpers';

/* Service imports */
import { ProcessService } from '../../services/process/process.service';
import { RecipeService } from '../../services/recipe/recipe.service';
import { ToastService } from '../../services/toast/toast.service';


@Component({
  selector: 'active-batches',
  templateUrl: './active-batches.component.html',
  styleUrls: ['./active-batches.component.scss']
})
export class ActiveBatchesComponent implements OnInit, OnDestroy {
  @Input() rootURL: string = 'tabs/home';
  @ViewChildren('batchSlidingItemsList') slidingItemsList: IonList;
  activeBatchesList: Batch[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public processService: ProcessService,
    public recipeService: RecipeService,
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
          this.activeBatchesList = getArrayFromObservables(activeBatchesList$);
        },
        (error: string): void => {
          console.log('Batch list error', error);
          this.toastService.presentErrorToast('Error loading batch list');
        }
      );
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
}
