/* Module imports */
import { Injectable } from '@angular/core';

/* Interface imports */
import { HopsSchedule, Process, SelectedUnits, TimerProcess } from '@shared/interfaces';

/* Service imports */
import { CalculationsService } from '@services/calculations/calculations.service';
import { IdService } from '@services/id/id.service';
import { PreferencesService } from '@services/preferences/preferences.service';
import { UtilityService } from '@services/utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class ProcessComponentHelperService {

  constructor(
    public calculator: CalculationsService,
    public idService: IdService,
    public preferenceService: PreferencesService,
    public utilService: UtilityService
  ) { }

  /**
   * Generate timer process steps for boil step; update duration on form update
   *
   * @param: schedule - a recipe variant's process schedule
   * @param: boilDuration - boil duration time in minutes
   * @param: hops - a recipe variant's hops schedue
   * @return: new process schedule with generated boil step
   */
  autoSetBoilDuration(schedule: Process[], boilDuration: number, hops: HopsSchedule[]): Process[] {
    const boilIndex: number = this.getProcessIndex(schedule, 'name', 'Boil');
    if (boilIndex === -1) {
      schedule.push(<TimerProcess>{
        cid: this.idService.getNewId(),
        type: 'timer',
        name: 'Boil',
        description: 'Boil wort',
        duration: boilDuration,
        concurrent: false,
        splitInterval: 1
      });
    } else {
      const boilStep: TimerProcess = <TimerProcess>schedule[boilIndex];
      if (boilStep.duration !== boilDuration) {
        boilStep.duration = boilDuration;
        return this.autoSetHopsAdditions(schedule, boilDuration, hops);
      }
    }
    return schedule;
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
    const currentBoilIndex: number = this.getProcessIndex(schedule, 'name', 'Boil');
    if (currentBoilIndex !== -1) {
      // remove existing hops timers
      const preFilteredProcessSchedule: Process[] = schedule
        .filter((process: Process): boolean => {
          return !process.name.match(/^(Add).*(hops)$/);
        });
      // get steps before first hops addition
      const updatedBoilIndex: number = this.getProcessIndex(preFilteredProcessSchedule, 'name', 'Boil');
      const preAdditionSchedule: Process[] = preFilteredProcessSchedule.splice(0, updatedBoilIndex);
      // get new hops addition process steps
      const hopsProcesses: Process[] = this.generateHopsProcesses(hops, boilDuration);
      // recombine process schedule
      const newProcessSchedule: Process[] = preAdditionSchedule
        .concat(hopsProcesses)
        .concat(preFilteredProcessSchedule);

      // set boil step timer as concurrent is timers were added
      const finalBoilIndex: number = updatedBoilIndex + hopsProcesses.length;
      (<TimerProcess>newProcessSchedule[finalBoilIndex]).concurrent = !!hopsProcesses.length;
      return newProcessSchedule;
    }
    return schedule;
  }

  /**
   * Generate timer process steps for mash step; update duration on form update
   *
   * @param: schedule - a recipe variant's process schedule
   * @param: mashDuration - mash duration time in minutes
   * @return: none
   */
  autoSetMashDuration(schedule: Process[], mashDuration: number): void {
    const mashIndex: number = this.getProcessIndex(schedule, 'name', 'Mash');
    if (mashIndex === -1) {
      schedule.push(<TimerProcess>{
        cid: this.idService.getNewId(),
        type: 'timer',
        name: 'Mash',
        description: 'Mash grains',
        duration: mashDuration,
        concurrent: false,
        splitInterval: 1
      });
    } else {
      (<TimerProcess>schedule[mashIndex]).duration = mashDuration;
    }
  }

  /**
   * Format a hops addition step description
   *
   * @param: hops - a recipe variant's hops schedule
   * @return: a description for a new hops process timer step
   */
  formatHopsDescription(hops: HopsSchedule): string {
    const units: SelectedUnits = this.preferenceService.getSelectedUnits();
    let hopsQuantity: number = hops.quantity;
    if (this.calculator.requiresConversion('weightSmall', units)) {
      hopsQuantity = this.calculator.convertWeight(hops.quantity, false, false);
    }

    const twoPlaces: number = 2;
    hopsQuantity = this.utilService.roundToDecimalPlace(hopsQuantity, twoPlaces);
    return `Hops addition: ${hopsQuantity}${units.weightSmall.shortName}`;
  }

  /**
   * Create an array of concurrent timer processes for each hops addition
   *
   * @param: hops - a recipe variant's hops schedule
   * @param: boilDuration - a recipe variant's set boil duration
   * @return: array of concurrent timer processes
   */
  generateHopsProcesses(hops: HopsSchedule[], boilDuration: number): Process[] {
    return hops
      .filter((hopsInstance: HopsSchedule): boolean => !hopsInstance.dryHop)
      .sort((h1: HopsSchedule, h2: HopsSchedule): number => h2.duration - h1.duration)
      .map((hopsAddition: HopsSchedule): TimerProcess => {
        return {
          cid: this.idService.getNewId(),
          type: 'timer',
          name: `Add ${hopsAddition.hopsType.name} hops`,
          concurrent: true,
          description: this.formatHopsDescription(hopsAddition),
          duration: boilDuration - hopsAddition.duration,
          splitInterval: 1
        };
      });
  }

  /**
   * Get a process step index from a given process schedule
   *
   * @param: schedule - the process schedule to search
   * @param: searchField - the process attribute name to comare with search term
   * @param: searchTerm - the search term to match against a given search field value
   * @return: the index number of the found process or -1 if not found
   */
  getProcessIndex(schedule: Process[], searchField: string, searchTerm: string): number {
    return schedule.findIndex((process: Process): boolean => process[searchField] === searchTerm);
  }

}
