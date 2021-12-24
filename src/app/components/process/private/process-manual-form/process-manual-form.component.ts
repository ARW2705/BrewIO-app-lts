/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Constant imports */
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@shared/constants';

/* Interface imports */
import { ManualProcess } from '@shared/interfaces';


@Component({
  selector: 'app-process-manual-form',
  templateUrl: './process-manual-form.component.html',
  styleUrls: ['./process-manual-form.component.scss'],
})
export class ProcessManualFormComponent implements AfterViewInit, OnInit {
  @Input() update: ManualProcess;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  manualForm: FormGroup;

  constructor(public formBulder: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.manualForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: string): void => this.formStatusEvent.emit(status === 'VALID'));
  }

  /**
   * Assign timer step to update values to form
   *
   * @param: none
   * @return: none
   */
  assignFormValues(): void {
    this.manualForm.controls.name.setValue(this.update.name);
    this.manualForm.controls.description.setValue(this.update.description);
    this.manualForm.controls.expectedDuration.setValue(this.update.expectedDuration);
  }

  /**
   * Get the manual form's values
   *
   * @param: none
   * @return: manual form values as object
   */
  getFormResult(): ManualProcess {
    const formResult: object = this.manualForm.value;
    Object.assign(formResult, { type: 'manual' });
    return <ManualProcess>formResult;
  }

  /**
   * Create the form
   *
   * @param: none
   * @return: none
   */
  initForm(): void {
    this.manualForm = this.formBulder.group({
      name            : [''  , [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
      description     : [''  , [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]                                                     ],
      expectedDuration: [null, [Validators.min(0)]                                                                                ]
    });

    if (this.update) {
      this.assignFormValues();
    }
  }

}
