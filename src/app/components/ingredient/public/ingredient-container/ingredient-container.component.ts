/* Module imports */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { forkJoin } from 'rxjs';

/* Interface imports */
import { GrainBill, Grains, Hops, HopsSchedule, IngredientUpdateEvent, OtherIngredients, RecipeVariant, Yeast, YeastBatch } from '@shared/interfaces';

/* Component imports */
import { IngredientFormComponent } from '@components/ingredient/public/ingredient-form/ingredient-form.component';

/* Service imports */
import { ActionSheetService, ErrorReportingService, LibraryService, ModalService } from '@services/public';


@Component({
  selector: 'app-ingredient-container',
  templateUrl: './ingredient-container.component.html',
  styleUrls: ['./ingredient-container.component.scss'],
})
export class IngredientContainerComponent implements OnInit {
  @Input() isAddButtonDisabled: boolean;
  @Input() variant: RecipeVariant;
  @Input() refresh: boolean;
  @Output() ingredientUpdateEvent: EventEmitter<IngredientUpdateEvent> = new EventEmitter<IngredientUpdateEvent>();
  grainsLibrary: Grains[] = null;
  hopsLibrary: Hops[] = null;
  yeastLibrary: Yeast[] = null;

  constructor(
    public actionService: ActionSheetService,
    public errorReporter: ErrorReportingService,
    public libraryService: LibraryService,
    public modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.getIngredientLibraries();
  }

  /**
   * Get style and ingredient libraries
   *
   * @params: none
   * @return: none
   */
  getIngredientLibraries(): void {
    forkJoin([
      this.libraryService.getGrainsLibrary(),
      this.libraryService.getHopsLibrary(),
      this.libraryService.getYeastLibrary()
    ])
    .subscribe(
      ([grainsLibrary, hopsLibrary, yeastLibrary]: [Grains[], Hops[], Yeast[]]): void => {
        this.grainsLibrary = grainsLibrary;
        this.hopsLibrary = hopsLibrary;
        this.yeastLibrary = yeastLibrary;
      },
      (error: any): void => this.errorReporter.handleUnhandledError(error)
    );
  }

  /**
   * Open ingredient form action sheet to select ingredient type to open
   *
   * @params: none
   * @return: none
   */
  openIngredientActionSheet(): void {
    this.actionService.openActionSheet(
      'Select an Ingredient',
      [
        {
          text: 'Grains',
          handler: (): void => { this.openIngredientFormModal('grains'); }
        },
        {
          text: 'Hops',
          handler: (): void => { this.openIngredientFormModal('hops'); }
        },
        {
          text: 'Yeast',
          handler: (): void => { this.openIngredientFormModal('yeast'); }
        },
        {
          text: 'Other',
          handler: (): void => { this.openIngredientFormModal('otherIngredients'); }
        }
      ]
    );
  }

  /**
   * Configure ingredient form modal options
   *
   * @params: type - the ingredient type
   * @params: [toUpdate] - optional current ingredient data to edit or delete
   *
   * @return: configuration object
   */
  getIngredientFormModalOptions(
    type: string,
    toUpdate?: GrainBill | HopsSchedule | YeastBatch | OtherIngredients
  ): object {
    const data: object = {
      ingredientType: type,
      update: toUpdate,
      boilTime: this.variant.boilDuration
    };

    if (type === 'grains') {
      Object.assign(data, { ingredientLibrary: this.grainsLibrary });
    } else if (type === 'hops') {
      Object.assign(data, { ingredientLibrary: this.hopsLibrary });
    } else if (type === 'yeast') {
      Object.assign(data, { ingredientLibrary: this.yeastLibrary });
    }
    // No additional data needed for an 'other ingredient'

    return data;
  }

  /**
   * Open modal to create, edit, or delete specified ingredient type
   *
   * @params: type - the ingredient type ('grains', 'hops', etc)
   * @params: [toUpdate] - current ingredient data to edit or delete
   *
   * @return: none
   */
  openIngredientFormModal(
    type: string,
    toUpdate?: GrainBill | HopsSchedule | OtherIngredients | YeastBatch
  ): void {
    this.modalService.openModal<GrainBill | HopsSchedule | OtherIngredients | YeastBatch | { delete: boolean }>(
      IngredientFormComponent,
      this.getIngredientFormModalOptions(type, toUpdate)
    )
    .subscribe(
      (ingredient: GrainBill | HopsSchedule | OtherIngredients | YeastBatch | { delete: boolean }): void => {
        if (ingredient) {
          this.ingredientUpdateEvent.emit({ type, toUpdate, ingredient });
        }
      },
      (error: Error): void => this.errorReporter.handleUnhandledError(error)
    );
  }

}
