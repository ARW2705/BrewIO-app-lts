/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Constant imports */
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '../../../../shared/constants';

/* Interface imports */
import { CalendarProcess } from '../../../../shared/interfaces';


@Component({
  selector: 'app-process-calendar-form',
  templateUrl: './process-calendar-form.component.html',
  styleUrls: ['./process-calendar-form.component.scss'],
})
export class ProcessCalendarFormComponent implements AfterViewInit, OnInit {
  @Input() update: CalendarProcess;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  calendarForm: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public formBulder: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.calendarForm.statusChanges
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
    this.calendarForm.controls.name.setValue(this.update.name);
    this.calendarForm.controls.description.setValue(this.update.description);
    this.calendarForm.controls.duration.setValue(this.update.duration);
  }

  /**
   * Get the calendar form's values
   *
   * @param: none
   * @return: calendar form values as object
   */
  getFormResult(): CalendarProcess {
    const formResult: object = this.calendarForm.value;
    Object.assign(formResult, { type: 'calendar' });
    return <CalendarProcess>formResult;
  }

  /**
   * Create the form
   *
   * @param: none
   * @return: none
   */
  initForm(): void {
    this.calendarForm = this.formBulder.group({
      name       : ['', [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
      description: ['', [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]                                                     ],
      duration   : [null, [Validators.min(0), Validators.required]                                                           ]
    });

    if (this.update) {
      this.assignFormValues();
    }
  }

}
