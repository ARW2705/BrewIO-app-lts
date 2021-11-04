/* Module imports */
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/* Constant imports */
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '../../../../shared/constants';

/* Interface imports */
import { TimerProcess } from '../../../../shared/interfaces';


@Component({
  selector: 'app-process-timer-form',
  templateUrl: './process-timer-form.component.html',
  styleUrls: ['./process-timer-form.component.scss'],
})
export class ProcessTimerFormComponent implements AfterViewInit, OnInit {
  @Input() update: TimerProcess;
  @Output() formStatusEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  destroy$: Subject<boolean> = new Subject<boolean>();
  timerForm: FormGroup;

  constructor(public formBulder: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.timerForm.statusChanges
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
    this.timerForm.controls.name.setValue(this.update.name);
    this.timerForm.controls.description.setValue(this.update.description);
    this.timerForm.controls.duration.setValue(this.update.duration);
    this.timerForm.controls.concurrent.setValue(this.update.concurrent);
    this.timerForm.controls.splitInterval.setValue(this.update.splitInterval);
  }

  /**
   * Get the timer form's values
   *
   * @param: none
   * @return: timer form values as object
   */
  getFormResult(): TimerProcess {
    const formResult: object = this.timerForm.value;
    Object.assign(formResult, { type: 'timer' });
    return <TimerProcess>formResult;
  }

  /**
   * Create the form
   *
   * @param: none
   * @return: none
   */
  initForm(): void {
    this.timerForm = this.formBulder.group({
      name         : ['', [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
      description  : ['', [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]                                                     ],
      duration     : ['', [Validators.min(0), Validators.required]                                                           ],
      concurrent   : false,
      splitInterval: [1, [Validators.min(1)]                                                                                 ]
    });

    if (this.update) {
      this.assignFormValues();
    }
  }
}
