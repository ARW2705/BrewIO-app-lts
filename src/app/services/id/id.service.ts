/* Module imports */
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class IdService {
  cid: number;
  defaultIdRegex: RegExp = RegExp(/^[\d]{13}$/);

  constructor() {
    this.cid = Date.now();
  }

  /**
   * Get an id from an object, prioritizing _id
   *
   * @params: obj - an object that may contain an id
   *
   * @return: the id as a string else undefined
   */
  getId(obj: object): string {
    if (!obj) return undefined;
    if (obj['_id'] !== undefined) return obj['_id'];
    if (obj['cid'] !== undefined) return obj['cid'];
    return undefined;
  }

  /**
   * Get the index of an array of objects that has a specific id string
   *
   * @params: id - id string to search
   * @params: arr - array of objects with an _id property
   *
   * @return: index of object with matching id or -1 if none found
   */
  getIndexById(id: string, arr: object[]): number {
    return arr.findIndex((obj: object) => this.hasId(obj, id));
  }

  /**
   * Generate a new client side id that is numeric only
   *
   * @params: none
   *
   * @return: an id as a string of numbers
   */
  getNewId(): string {
    return (this.cid++).toString();
  }

  /**
   * Check if the given id is client (default) or server generated
   * Server generated ids are 24 chars long, client generated are unix timestamps
   * in milliseconds
   *
   * @params: id - id as a string
   *
   * @return: true if id contains no letters
   */
  hasDefaultIdType(id: string): boolean {
    if (id === undefined) {
      return true;
    }
    return this.defaultIdRegex.test(id);
  }

  /**
   * Check if object has search id either as _id or cid property
   *
   * @params: obj - object in which to search
   * @params: searchId - id to compare
   *
   * @return: true if either obj _id or cid matches searchId
   */
  hasId(obj: object, searchId: string): boolean {
    if (searchId === null || searchId === undefined) {
      return false;
    }

    return obj['_id'] === searchId || obj['cid'] === searchId;
  }

  /**
   * Check if a server id has been set as '_id' property
   *
   * @params: id - id as a string
   *
   * @return: true if id is undefined
   */
  isMissingServerId(id: string): boolean {
    return id === undefined || id === null;
  }

}
