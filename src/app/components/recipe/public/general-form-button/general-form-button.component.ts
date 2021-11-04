/* Module imports */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/* Interface imports */
import { RecipeMaster, RecipeVariant, Style } from '../../../../shared/interfaces';

/* Page imports */
import { GeneralFormComponent } from '../general-form/general-form.component';

/* Service imports */
import { ErrorReportingService, LibraryService, ModalService } from '../../../../services/services';


@Component({
  selector: 'app-general-form-button',
  templateUrl: './general-form-button.component.html',
  styleUrls: ['./general-form-button.component.scss'],
})
export class GeneralFormButtonComponent implements OnInit {
  @Input() formType: string;
  @Input() docMethod: string;
  @Input() isGeneralFormComplete: boolean;
  @Input() master: RecipeMaster;
  @Input() variant: RecipeVariant;
  @Output() generalFormEvent: EventEmitter<object> = new EventEmitter<object>();
  styleLibrary: Style[] = null;

  constructor(
    public errorReporter: ErrorReportingService,
    public libraryService: LibraryService,
    public modalService: ModalService
  ) { }

  ngOnInit() {
    this.getStyleLibraries();
  }

  getStyleLibraries(): void {
    this.libraryService.getStyleLibrary()
      .subscribe(
        (styleLibrary: Style[]): void => {
          this.styleLibrary = <Style[]>styleLibrary;
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Configure options for general form modal
   *
   * @params: none
   *
   * @return: configuration object
   */
  getGeneralFormModalOptions(): object {
    const data: object = {
      formType: this.formType,
      docMethod: this.docMethod,
      update: this.getGeneralFormModalUpdateData()
    };
    if (!this.isGeneralFormComplete && this.formType === 'master') {
      data['styles'] = this.styleLibrary;
    } else if (this.isGeneralFormComplete) {
      if (this.formType === 'master') {
        data['update']['name'] = this.master.name;
        data['styles'] = this.styleLibrary;
      } else {
        data['update']['variantName'] = this.variant.variantName;
      }
    }

    return data;
  }

  /**
   * Get current values to be filled in as overrides
   * for default values on the general form
   *
   * @params: none
   *
   * @return: current form values to fill in if updating
   * the general info; else null
   */
  getGeneralFormModalUpdateData(): object {
    if (this.isGeneralFormComplete || this.formType === 'variant') {
      return {
        labelImage: this.master.labelImage,
        style: this.master.style,
        brewingType: this.variant.brewingType,
        mashDuration: this.variant.mashDuration,
        boilDuration: this.variant.boilDuration,
        batchVolume: this.variant.batchVolume,
        boilVolume: this.variant.boilVolume,
        efficiency: this.variant.efficiency,
        mashVolume: this.variant.mashVolume,
        isFavorite: this.variant.isFavorite,
        isMaster: this.variant.isMaster
      };
    }
    return null;
  }

  /**
   * Open general recipe form modal - pass current data for update, if present
   *
   * @params: none
   * @return: none
   */
  openGeneralFormModal(): void {
    this.modalService.openModal<object>(GeneralFormComponent, this.getGeneralFormModalOptions())
      .subscribe(
        (formValues: object): void => {
          if (formValues) {
            this.generalFormEvent.emit(formValues);
          }
        },
        (error: Error): void => this.errorReporter.handleUnhandledError(error)
      );
  }

}
