/* Module imports */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Interface imports*/
import { Batch, InventoryItem, SyncData, SyncError, SyncMetadata, SyncRequests, SyncResponse } from '@shared/interfaces';

/* Service imports */
import { ErrorReportingService } from '@services/error-reporting/error-reporting.service';
import { IdService } from '@services/id/id.service';
import { InventoryHttpService } from '@services/inventory/http/inventory-http.service';
import { InventoryTypeGuardService } from '@services/inventory/type-guard/inventory-type-guard.service';
import { ProcessService } from '@services/process/process.service';
import { SyncService } from '@services/sync/sync.service';
import { UserService } from '@services/user/user.service';
import { UtilityService } from '@services/utility/utility.service';


@Injectable({
  providedIn: 'root'
})
export class InventorySyncService {
  readonly syncBaseRoute: string = 'inventory';
  syncErrors: SyncError[] = [];

  constructor(
    public errorReporter: ErrorReportingService,
    public idService: IdService,
    public inventoryHttpService: InventoryHttpService,
    public inventoryTypeGuardService: InventoryTypeGuardService,
    public processService: ProcessService,
    public syncService: SyncService,
    public userService: UserService,
    public utilService: UtilityService
  ) { }

  /**
   * Add a sync flag for inventory
   *
   * @param: method - the sync action
   * @param: docId - the id of the sync target
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    const syncFlag: SyncMetadata = {
      docId,
      method,
      docType: 'inventory'
    };
    this.syncService.addSyncFlag(syncFlag);
  }

  /**
   * Convert an http request method name to a sync method name
   *
   * @param: requestMethod - the http request method name
   * @return: the sync method counterpart of request method
   */
  convertRequestMethodToSyncMethod(requestMethod: string): string {
    return this.syncService.convertRequestMethodToSyncMethod(requestMethod);
  }

  /**
   * Clear all sync errors
   *
   * @param: none
   * @return: none
   */
  dismissAllSyncErrors(): void {
    this.syncErrors = [];
  }

  /**
   * Clear a sync error at the given index
   *
   * @param: index - error array index to remove
   * @return: none
   */
  dismissSyncError(index: number): void {
    this.syncErrors.splice(index, 1);
  }

  /**
   * Generate a new sync request based on syncFlag and associated item
   *
   * @param: none
   * @return: observable of sync requests and any non-server errors
   */
  generateSyncRequests(inventoryList: InventoryItem[]): SyncRequests<InventoryItem> {
    const errors: SyncError[] = [];
    const requests: Observable<HttpErrorResponse | InventoryItem | SyncData<InventoryItem>>[] = [];

    this.syncService.getSyncFlagsByType('inventory')
      .forEach((syncFlag: SyncMetadata): void => {
        const item: InventoryItem = inventoryList.find((_item: InventoryItem): boolean => {
          return this.idService.hasId(_item, syncFlag.docId);
        });

        if (item === undefined && syncFlag.method !== 'delete') {
          const errMsg: string = `Sync error: Item with id '${syncFlag.docId}' not found`;
          errors.push(this.syncService.constructSyncError(errMsg));
          return;
        } else if (syncFlag.method === 'delete') {
          requests.push(this.inventoryHttpService.configureSyncBackgroundRequest('delete', true, null, syncFlag.docId));
          return;
        }

        // TODO extract to its own method
        if (
          item.optionalItemData.batchId !== undefined
          && this.idService.hasDefaultIdType(item.optionalItemData.batchId)
        ) {
          const batch: Batch = this.processService.getBatchById(item.optionalItemData.batchId);

          if (batch !== undefined && !this.idService.hasDefaultIdType(batch._id)) {
            item.optionalItemData.batchId = batch._id;
          }
        }

        if (syncFlag.method === 'update' && this.idService.isMissingServerId(item._id)) {
          const errMsg: string = `Item with id: '${item.cid}' is missing its server id`;
          errors.push(this.syncService.constructSyncError(errMsg));
        } else if (syncFlag.method === 'create') {
          item['forSync'] = true;
          requests.push(this.inventoryHttpService.configureSyncBackgroundRequest('post', true, item));
        } else if (syncFlag.method === 'update' && !this.idService.isMissingServerId(item._id)) {
          requests.push(this.inventoryHttpService.configureSyncBackgroundRequest('patch', true, item));
        } else {
          const errMsg: string = `Sync error: Unknown sync flag method '${syncFlag.method}'`;
          errors.push(this.syncService.constructSyncError(errMsg));
        }
      });

    return { syncRequests: requests, syncErrors: errors };
  }

  /**
   * Process sync successes to update in memory items
   *
   * @param: syncData - an array of successfully synced docs; deleted docs
   * will contain a special flag to avoid searching for a removed doc
   * @return: the post processed inventory list
   */
  processSyncSuccess(syncData: (InventoryItem | SyncData<InventoryItem>)[], inventoryList: InventoryItem[]): InventoryItem[] {
    syncData.forEach((_syncData: InventoryItem | SyncData<InventoryItem>): void => {
      if (_syncData['isDeleted'] === undefined) {
        const itemIndex: number = inventoryList.findIndex((item: InventoryItem): boolean => {
          return this.idService.hasId(item, (<InventoryItem>_syncData).cid);
        });

        if (itemIndex === -1) {
          this.syncErrors.push({
            errCode: -1,
            message: `Inventory item with id: ${(<InventoryItem>_syncData).cid} not found`
          });
        } else {
          this.inventoryTypeGuardService.checkTypeSafety(_syncData);
          inventoryList[itemIndex] = <InventoryItem>_syncData;
        }
      }
    });

    return inventoryList;
  }

  /**
   * Process all sync flags on a login or reconnect event
   *
   * @param: onLogin - true if calling sync at login, false for sync on reconnect
   * @return: observable of processed sync response inventory list
   */
  syncOnConnection(onLogin: boolean, inventoryList: InventoryItem[]): Observable<InventoryItem[]> {
    // Ignore reconnects if not logged in
    if (!onLogin && !this.userService.isLoggedIn()) {
      return of(null);
    }

    const syncRequests: SyncRequests<InventoryItem> = this.generateSyncRequests(inventoryList);
    const errors: SyncError[] = syncRequests.syncErrors;
    const requests: (
      Observable<HttpErrorResponse | InventoryItem | SyncData<InventoryItem>>[]
    ) = syncRequests.syncRequests;

    return this.syncService.sync('inventory', requests)
      .pipe(
        map((responses: SyncResponse<InventoryItem>): InventoryItem[] => {
          this.syncErrors = responses.errors.concat(errors);
          if (!onLogin) {
            return this.processSyncSuccess(
              <(InventoryItem | SyncData<InventoryItem>)[]>responses.successes,
              inventoryList
            );
          }
          return null;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Post all stored inventory items to server
   *
   * @param: inventoryList - the current inventory list to init the server with
   * @return: observable of server response list
   */
  syncOnSignup(inventoryList: InventoryItem[]): Observable<InventoryItem[]> {
    const requests: (Observable<HttpErrorResponse | InventoryItem>)[] = inventoryList.map(
      (item: InventoryItem): Observable<HttpErrorResponse | InventoryItem> => {
        const payload: InventoryItem = this.utilService.clone(item);
        const batch: Batch = this.processService.getBatchById(item.optionalItemData.batchId);
        if (batch) {
          payload['optionalItemData']['batchId'] = this.idService.getId(batch);
        }

        payload['forSync'] = true;
        return this.inventoryHttpService.configureSyncBackgroundRequest('post', false, payload);
      }
    );

    return this.syncService.sync('inventory', requests)
      .pipe(
        map((responses: SyncResponse<InventoryItem>): InventoryItem[] => {
          this.syncErrors = responses.errors;
          return this.processSyncSuccess(
            <(InventoryItem | SyncData<InventoryItem>)[]>responses.successes,
            inventoryList
          );
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }
}
