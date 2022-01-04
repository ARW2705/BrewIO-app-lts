/* Module imports */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

/* Interface imports */
import { Batch, CalendarMetadata, CalendarProcess, HopsSchedule, PrimaryValues, Process } from '@shared/interfaces';

/* Service imports */
import { CalculationsService } from '@services/calculations/calculations.service';
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { ProcessComponentHelperService } from '@services/process/component-helper/process-component-helper.service';
import { ProcessHttpService } from '@services/process/http/process-http.service';
import { ProcessStateService } from '@services/process/state/process-state.service';
import { ProcessSyncService } from '@services/process/sync/process-sync.service';
import { ProcessTypeGuardService } from '@services/process/type-guard/process-type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  constructor(
    public calculator: CalculationsService,
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public processComponentHelperService: ProcessComponentHelperService,
    public processHttpService: ProcessHttpService,
    public processStateService: ProcessStateService,
    public processSyncService: ProcessSyncService,
    public processTypeGuardService: ProcessTypeGuardService
  ) { }

  /***** API access methods *****/

  /**
   * Complete a batch by marking it as archived
   *
   * @param: batchId - batch id to update; batch must have server id to update database
   * @return: observable of ended batch
   */
  endBatchById(batchId: string): Observable<Batch> {
    const batch: Batch = this.getBatchById(batchId);
    if (!batch) {
      return throwError(
        this.processStateService.getMissingError(`Error ending batch: batch with id ${batchId} not found`)
      );
    }
    batch.isArchived = true;
    return this.updateBatch(batch)
      .pipe(
        mergeMap((): Observable<Batch> => this.processStateService.archiveActiveBatch(batchId)),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Get a batch by id
   *
   * @param: batchId - the batch id to search for
   * @return: a batch object or undefined if not found
   */
  getBatchById(batchId: string): Batch {
    return this.processStateService.getBatchById(batchId);
  }

  /**
   * Get active or archive batch list subject
   *
   * @param: isActive - true for active batch, false for archive batch
   * @return: subject of array of batch subjects
   */
  getBatchList(isActive: boolean): BehaviorSubject<BehaviorSubject<Batch>[]> {
    return this.processStateService.getBatchList(isActive);
  }

  /**
   * Get a batch behavior subject from list by id
   *
   * @param: batchId - the batch id to search for
   * @return: the BehaviorSubject of batch from the list or undefined if not found
   */
  getBatchSubjectById(batchId: string): BehaviorSubject<Batch> {
    return this.processStateService.getBatchSubjectById(batchId);
  }

  /**
   * Start a new batch process and add new batch to active list
   *
   * @param: userId - client user's id
   * @param: recipeMasterId - recipe master id that contains the recipe
   * @param: recipeVariantId - recipe variant id to base batch on
   * @return: observable of new batch
   */
  startNewBatch(userId: string, recipeMasterId: string, recipeVariantId: string): Observable<Batch> {
    return this.processStateService.generateBatchFromRecipe(userId, recipeMasterId, recipeVariantId);
  }

  /**
   * Update a batch
   *
   * @param: updatedBatch - batch with new values
   * @param: isActive - true for active batch, false for archive batch; defaults to true
   * @return: Observable of updated batch
   */
  updateBatch(updatedBatch: Batch, isActive: boolean = true): Observable<Batch> {
    this.processStateService.setBatch(updatedBatch, isActive);
    this.processStateService.sendBackgroundRequest('patch', updatedBatch);
    return of(updatedBatch);
  }

  /**
   * Update a batch's measured values in annotations
   *
   * @param: batchId - id of the batch to update
   * @param: update - primary values to apply to batch
   * @param: isActive - true for active batch, false for archive batch
   * @return: observable of updated batch
   */
  updateMeasuredValues(batchId: string, update: PrimaryValues, isActive: boolean): Observable<Batch> {
    try {
      const batch: Batch = this.getBatchById(batchId);
      update.ABV = this.calculator.getABV(update.originalGravity, update.finalGravity);
      update.IBU = this.calculator.calculateTotalIBU(
        batch.contextInfo.hops,
        update.originalGravity,
        update.batchVolume,
        batch.contextInfo.boilVolume
      );
      update.SRM = this.calculator.calculateTotalSRM(
        batch.contextInfo.grains,
        update.batchVolume
      );
      batch.annotations.measuredValues = update;
      return this.updateBatch(batch, isActive);
    } catch (error) {
      console.log('Update measured values error', error);
      return this.errorReporter.handleGenericCatchError()(error);
    }
  }

  /**
   * Update individual batch step
   *
   * @param: batchId - batch id to update
   * @param: stepUpdate - step update object to apply
   * @return: observable of updated batch
   */
  updateCalendarStep(batchId: string, calendarUpdate: CalendarMetadata): Observable<Batch> {
    try {
      const batch: Batch = this.getBatchById(batchId);
      const processIndex: number = batch.process.schedule.findIndex((step: Process) => {
        return this.idService.hasId(step, calendarUpdate.id);
      });
      batch.process.alerts = batch.process.alerts.concat(calendarUpdate.alerts);
      const calendarProcess: CalendarProcess = <CalendarProcess>batch.process.schedule[processIndex];
      calendarProcess.startDatetime = calendarUpdate.startDatetime;

      return this.updateBatch(batch);
    } catch (error) {
      const userMessage: string = 'An error occurring trying to update batch step';
      return throwError(this.processStateService.getMissingError(error.message, userMessage));
    }
  }

  /***** End API access methods *****/


  /***** Component helper methods *****/

  /**
   * Generate timer process steps for boil step; update duration on form update
   *
   * @param: schedule - a recipe variant's process schedule
   * @param: boilDuration - boil duration time in minutes
   * @param: hops - a recipe variant's hops schedue
   * @return: new process schedule with generated boil step
   */
  autoSetBoilDuration(schedule: Process[], boilDuration: number, hops: HopsSchedule[]): Process[] {
    return this.processComponentHelperService.autoSetBoilDuration(schedule, boilDuration, hops);
  }

  /**
   * Generate timer process steps for each hops addition (that is not a dry-hop)
   *
   * @param: schedule - a recipe variant's process schedule
   * @param: boilDuration - boil duration time in minutes
   * @param: hops - a recipe variant's hops schedue
   * @return: new process schedule with generated hops addition steps
   */
  autoSetHopsAdditions(schedule: Process[], boilDuration: number, hops: HopsSchedule[]): Process[] {
    return this.processComponentHelperService.autoSetHopsAdditions(schedule, boilDuration, hops);
  }

  /**
   * Generate timer process steps for mash step; update duration on form update
   *
   * @param: processSchedule - a recipe variant's process schedule
   * @param: mashDuration - mash duration time in minutes
   * @return: none
   */
  autoSetMashDuration(processSchedule: Process[], mashDuration: number): void {
    return this.processComponentHelperService.autoSetMashDuration(processSchedule, mashDuration);
  }

  /**
   * Format a hops addition step description
   *
   * @param: hops - a recipe variant's hops schedule
   * @return: a description for a new hops process timer step
   */
  formatHopsDescription(hops: HopsSchedule): string {
    return this.processComponentHelperService.formatHopsDescription(hops);
  }

  /**
   * Create an array of concurrent timer processes for each hops addition
   *
   * @param: hopsSchedule - a recipe variant's hops schedule
   * @param: boilDuration - a recipe variant's set boil duration
   * @return: array of concurrent timer processes
   */
  generateHopsProcesses(hopsSchedule: HopsSchedule[], boilDuration: number): Process[] {
    return this.processComponentHelperService.generateHopsProcesses(hopsSchedule, boilDuration);
  }

  /**
   * Get a process step index from a given process schedule
   *
   * @param: processSchedule - the process schedule to search
   * @param: searchField - the process attribute name to comare with search term
   * @param: searchTerm - the search term to match against a given search field value
   * @return: the index number of the found process or -1 if not found
   */
  getProcessIndex(processSchedule: Process[], searchField: string, searchTerm: string): number {
    return processSchedule.findIndex((process: Process): boolean => {
      return process[searchField] === searchTerm;
    });
  }

}
