/* Module imports */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, defaultIfEmpty, mergeMap, map, tap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION, BASE_URL } from '../../shared/constants';

/* Default imports */
import { defaultEnglishUnits, defaultImage } from '../../shared/defaults';

/* Type guard imports */
import { UserGuardMetadata } from '../../shared/type-guard-metadata/user.guard';

/* Type imports */
import { CustomError } from '../../shared/types';

/* utility imports */
import { getId, hasDefaultIdType } from '../../shared/utility-functions/id-helpers';

/* Interface imports */
import {
  Image,
  ImageRequestFormData,
  ImageRequestMetadata,
  LoginCredentials,
  SelectedUnits,
  SyncMetadata,
  SyncResponse,
  User,
  UserResponse
} from '../../shared/interfaces';

/* Service imports */
import { ConnectionService } from '../connection/connection.service';
import { ErrorReportingService } from '../error-reporting/error-reporting.service';
import { EventService } from '../event/event.service';
import { ImageService } from '../image/image.service';
import { PreferencesService } from '../preferences/preferences.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';
import { TypeGuardService } from '../type-guard/type-guard.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  user$: BehaviorSubject<User> = new BehaviorSubject<User>({
    _id: undefined,
    cid: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    username: undefined,
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    friendList: [],
    token: undefined,
    preferredUnitSystem: undefined,
    units: undefined
  });
  userStorageKey: string = 'user';

  constructor(
    public http: HttpClient,
    public connectionService: ConnectionService,
    public errorReporter: ErrorReportingService,
    public event: EventService,
    public httpError: HttpErrorService,
    public imageService: ImageService,
    public preferenceService: PreferencesService,
    public router: Router,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService,
    public typeGuard: TypeGuardService
  ) {
    console.log('user service');
  }

  /**
   * Request server check of json web token validity
   *
   * @param: none
   *
   * @return: Observable of UserResponse
   */
  checkJWToken(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${BASE_URL}/${API_VERSION}/users/checkJWToken`);
  }

  /**
   * Set user subject data to default values, clear user from ionic storage,
   * and emit event to call any other stored values to be cleared
   *
   * @param: none
   * @return: none
   */
  clearUserData(): void {
    const _defaultEnglishUnits: SelectedUnits = defaultEnglishUnits();
    const _defaultImage: Image = defaultImage();
    const blankUser: User = {
      _id: undefined,
      cid: 'offline',
      createdAt: undefined,
      updatedAt: undefined,
      username: '',
      firstname: undefined,
      lastname: undefined,
      email: undefined,
      friendList: [],
      token: '',
      preferredUnitSystem: _defaultEnglishUnits.system,
      units: _defaultEnglishUnits,
      breweryLabelImage: _defaultImage,
      userImage: _defaultImage
    };

    this.checkTypeSafety(blankUser);

    this.user$.next(blankUser);

    this.storageService.removeUser();
    this.event.emit('clear-data');
  }

  /**
   * Retrieve user authentication json web token
   *
   * @param: none
   *
   * @return: user's auth token
   */
  getToken(): string {
    return this.getUser().value.token;
  }

  /**
   * Get the user subject
   *
   * @param: none
   *
   * @return: user behavior subject
   */
  getUser(): BehaviorSubject<User> {
    return this.user$;
  }

  /**
   * Check if user is logged in
   *
   * @param: none
   *
   * @return: true if an auth token is present and not an empty string
   */
  isLoggedIn(): boolean {
    return this.getUser().value.token !== undefined && this.getUser().value.token !== '';
  }

  /**
   * Load user data from ionic storage. If user is not logged in, set app for
   * offline mode. Otherwise, check if json web token is valid. Remove stored
   * token if no longer valid. Finally, emit event to request other data
   *
   * @param: none
   * @return: none
   */
  loadUserFromStorage(): void {
    this.storageService.getUser()
      .subscribe(
        (user: User): void => {
          this.checkTypeSafety(user);

          this.user$.next(user);

          if (this.isLoggedIn()) {
            this.checkJWToken()
              .subscribe(
                (jwtResponse: UserResponse): void => console.log(jwtResponse.status),
                (error: any): void => {
                  this.errorReporter.handleUnhandledError(error);
                  this.clearUserData();
                  this.navToHome();
                }
              );
          } else {
            this.connectionService.setOfflineMode(true);
          }
          this.event.emit('init-recipes');
          this.preferenceService.setUnits(user.preferredUnitSystem, user.units);
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /**
   * Log user in with username and password. Update user subject with response.
   * If user selected to remember login, store user data in ionic storage
   *
   * @param: user - contains username, password, and remember boolean
   * @param: onSignupSync - true if logging in after initial sign up
   *
   * @return: observable with login response user data
   */
  logIn(user: LoginCredentials, onSignupSync: boolean): Observable<User> {
    return this.http.post<UserResponse>(`${BASE_URL}/${API_VERSION}/users/login`, user)
      .pipe(
        map((response: UserResponse): User => {
          this.checkTypeSafety(response.user);
          this.user$.next(response.user);
          this.connectionService.setOfflineMode(false);

          if (onSignupSync) {
            this.event.emit('sync-recipes-on-signup');
          } else {
            this.event.emit('init-recipes');
          }

          this.preferenceService.setUnits(response.user.preferredUnitSystem, response.user.units);

          if (user.remember) {
            this.storageService.setUser(response.user)
              .subscribe(
                (): void => console.log('stored user data'),
                (error: any): void => this.errorReporter.handleUnhandledError(error)
              );
          }

          return response.user;
        }),
        tap((): void => {
          this.syncOnConnection()
            .subscribe(
              (): void => console.log('user sync successful'),
              (error: any): void => this.errorReporter.handleUnhandledError(error)
            );
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Clear stored user data on logout and set connection to offline
   *
   * @param: none
   * @return: none
   */
  logOut(): void {
    this.connectionService.setOfflineMode(true);
    this.clearUserData();
  }

  /**
   * Copy data from updated user or partial user values to current user
   *
   * @param: userUpdate - object with new user values
   * @param: [inputUser] - optional given user to apply new values to;
   * uses current user if input not given
   *
   * @return: none
   */
  mapUserData(userUpdate: User | object, inputUser?: User): void {
    const user$: BehaviorSubject<User> = this.getUser();
    const user: User = inputUser || user$.value;

    for (const key in userUpdate) {
      if (userUpdate.hasOwnProperty(key)) {
        if (user[key] && userUpdate[key] && typeof userUpdate[key] === 'object') {
          if (Array.isArray(userUpdate[key])) {
            user[key] = userUpdate[key];
          } else {
            for (const innerKey in userUpdate[key]) {
              if (userUpdate[key].hasOwnProperty(innerKey)) {
                user[key][innerKey] = userUpdate[key][innerKey];
              }
            }
          }
        } else {
          user[key] = userUpdate[key];
        }
      }
    }

    if (!inputUser) {
      this.checkTypeSafety(user);
      user$.next(user);
    }
  }

  /**
   * Navigate to home page
   *
   * @param: none
   * @return: none
   */
  navToHome(): void {
    this.router.navigate(['tabs/home']);
  }

  /**
   * Sign up a new user and login if successful
   *
   * @param: user - user must contain at least a username, password, and email
   *
   * @return: if signup successful, return observable of login response, else signup response
   */
  signUp(user: User): Observable<UserResponse> {
    // Attach required user fields
    user['preferredUnitSystem'] = this.preferenceService.preferredUnitSystem;
    user['units'] = this.preferenceService.units;

    return forkJoin(this.composeImageStoreRequests(user))
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<ImageRequestMetadata[]> => {
          const imageRequests: ImageRequestFormData[] = this.composeImageUploadRequests(user);

          return this.imageService.blobbifyImages(imageRequests);
        }),
        mergeMap((imageData: ImageRequestMetadata[]): Observable<UserResponse> => {
          const formData: FormData = new FormData();
          formData.append('user', JSON.stringify(user));

          imageData.forEach((imageDatum: ImageRequestMetadata): void => {
            formData.append(imageDatum.name, imageDatum.blob, imageDatum.filename);
          });

          return this.http.post<UserResponse>(`${BASE_URL}/${API_VERSION}/users/signup`, formData);
        }),
        tap((): void => {
          this.logIn(
            {
              username: user['username'],
              password: user['password'],
              remember: true
            },
            true
          )
          .subscribe(
            (): void => console.log('Signup successful; log in successful'),
            (error: any): void => this.errorReporter.handleUnhandledError(error)
          );
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update user profile
   *
   * @param: user - object with new user profile data
   *
   * @return: Observable of user data from server
   */
  updateUserProfile(userUpdate: object): Observable<User> {
    const user$: BehaviorSubject<User> = this.getUser();
    const user: User = user$.value;

    // TODO handle image check and update
    const previousUserImagePath: string = user.userImage.filePath;
    const previousBreweryLabelImagePath: string = user.breweryLabelImage.filePath;

    this.mapUserData(userUpdate, user);

    const storeImages: Observable<Image>[] = this.composeImageStoreRequests(
      user,
      {
        userImage: previousUserImagePath,
        breweryLabelImage: previousBreweryLabelImagePath
      }
    );

    return forkJoin(storeImages)
      .pipe(
        defaultIfEmpty(null),
        mergeMap((): Observable<User> => {
          if (this.canSendRequest(getId(user))) {
            this.requestInBackground(user);
          } else {
            this.addSyncFlag('update', getId(user));
          }

          this.checkTypeSafety(user);

          user$.next(user);
          return of(user);
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**
   * Update stored user with current user
   *
   * @param: none
   * @return: none
   */
  updateUserStorage(): void {
    this.storageService.setUser(this.getUser().value)
      .subscribe(
        (): void => console.log('user data stored'),
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** Background Server Request *****/

  /**
   * Check if able to send an http request
   *
   * @param: userId - the user's id to check
   *
   * @return: true if connected to network, logged in, and has a server id
   */
  canSendRequest(userId: string): boolean {
    return this.connectionService.isConnected() && this.isLoggedIn() && !hasDefaultIdType(userId);
  }

  /**
   * Set up image storage function calls to persistently store image
   * If an existing persistent image is to be overridden, provide object with new paths
   *
   * @param: user - contains the image(s)
   * @param: replacementPaths - object with original paths for overriding persistent image
   *
   * @return: array of persistent image observables
   */
  composeImageStoreRequests(user: User, replacementPaths: object = {}): Observable<Image>[] {
    const storeImages: Observable<Image>[] = [];

    let imageName = 'userImage';
    let image: Image = user[imageName];

    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeImageToLocalDir(image, replacementPaths[imageName]));
    }

    imageName = 'breweryLabelImage';
    image = user[imageName];

    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeImageToLocalDir(image, replacementPaths[imageName]));
    }

    return storeImages;
  }

  /**
   * Set up image upload request data
   *
   * @param: user - user update object
   *
   * @return: array of objects with image and its formdata name
   */
  composeImageUploadRequests(user: User | object): ImageRequestFormData[] {
    const imageRequests: ImageRequestFormData[] = [];

    let imageName: string = 'userImage';
    let image: Image = user[imageName];

    if (image && image.hasPending) {
      imageRequests.push({ image: user[imageName], name: imageName });
    }

    imageName = 'breweryLabelImage';
    image = user[imageName];

    if (image && image.hasPending) {
      imageRequests.push({ image: user[imageName], name: imageName });
    }

    return imageRequests;
  }

  /**
   * Configure a background request while defining which error handling method to use
   *
   * @param: user - user update object
   * @param: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   *
   * @return: observable of User or HttpErrorResponse
   */
  configureBackgroundRequest(user: User | object, shouldResolveError: boolean): Observable<User> {
    const formData: FormData = new FormData();
    formData.append('user', JSON.stringify(user));

    const imageRequests: ImageRequestFormData[] = this.composeImageUploadRequests(user);

    return this.imageService.blobbifyImages(imageRequests)
      .pipe(
        mergeMap((imageData: ImageRequestMetadata[]): Observable<User> => {
          imageData.forEach((imageDatum: ImageRequestMetadata): void => {
            formData.append(imageDatum.name, imageDatum.blob, imageDatum.filename);
          });

          return this.http.patch<User>(`${BASE_URL}/${API_VERSION}/users/profile`, formData);
        }),
        catchError(this.errorReporter.handleResolvableCatchError<User>(shouldResolveError))
      );
  }

  /**
   * Get a server update object for the user
   *
   * @param: user - the user as the basis for the update - may have pre-saved updated values
   *
   * @return: object of user update body
   */
  configureRequestBody(user: User): object {
    const userValues: object = {};
    if (user.firstname) {
      userValues['firstname'] = user.firstname;
    }
    if (user.lastname) {
      userValues['lastname'] = user.lastname;
    }
    if (user.email) {
      userValues['email'] = user.email;
    }
    if (user.userImage) {
      userValues['userImage'] = user.userImage;
    }
    if (user.breweryLabelImage) {
      userValues['breweryLabelImage'] = user.breweryLabelImage;
    }
    return userValues;
  }

  /**
   * Perform background server http request - update local user with response
   *
   * @param: user - the user to push to server
   *
   * @return: none
   */
  requestInBackground(user: User): void {
    this.configureBackgroundRequest(this.configureRequestBody(user), false)
      .subscribe(
        (userResponse: User): void => {
          console.log('User: background patch request successful', userResponse);
          this.mapUserData(userResponse);
          this.updateUserStorage();
        },
        (error: any): void => this.errorReporter.handleUnhandledError(error)
      );
  }

  /***** End Background Server Request *****/


  /***** Server Sync *****/

  /**
   * Add a sync flag for a recipe
   *
   * @param: method - options: 'create', 'update', or 'delete'
   * @param: docId - document id to apply sync
   *
   * @return: none
   */
  addSyncFlag(method: string, docId: string): void {
    const syncFlag: SyncMetadata = {
      method: method,
      docId: docId,
      docType: 'user'
    };

    this.syncService.addSyncFlag(syncFlag);
  }

  /**
   * Process all sync flags on reconnect
   *
   * @param: none
   * @return: none
   */
  syncOnConnection(): Observable<boolean> {
    const user$: BehaviorSubject<User> = this.getUser();
    const user: User = user$.value;

    const requests: SyncMetadata[] = this.syncService.getSyncFlagsByType('user');
    if (!requests.length) {
      return of(true);
    }

    return this.syncService.sync('user', [this.configureBackgroundRequest(user, true)])
      .pipe(
        map((response: SyncResponse<User>): boolean => {
          console.log('sync complete', response);
          const userResponse: User = <User>response.successes[0];
          this.mapUserData(userResponse, user);

          this.checkTypeSafety(user);

          user$.next(user);
          return true;
        }),
        catchError(this.errorReporter.handleGenericCatchError())
      );
  }

  /**** End Server Sync *****/


  /***** Type Guard *****/

  checkTypeSafety(user: any): void {
    if (!this.isSafeUser(user)) {
      throw this.getUnsafeUserError(user);
    }
  }

  /**
   * Throw a custom error when an invalid user is encountered
   *
   * @param: thrownFor - given user object that failed validation
   *
   * @return: custom invalid user error
   */
  getUnsafeUserError(thrownFor: any): Error {
    return new CustomError(
      'UserError',
      `Given User is invalid: got\n${JSON.stringify(thrownFor, null, 2)}`,
      2,
      'An error occurred while updating user: invalid user'
    );
  }

  /**
   * Check if given user object is valid by correctly implementing the User interface
   *
   * @param: user - expects a User at runtime
   *
   * @return: true if given user correctly implements User interface
   */
  isSafeUser(user: any): boolean {
    if (!this.typeGuard.hasValidProperties(user, UserGuardMetadata)) {
      return false;
    }
    return (
      this.preferenceService.isValidUnits(user.units)
      && (!user.breweryLabelImage || this.imageService.isSafeImage(user.breweryLabelImage))
      && (!user.userImage || this.imageService.isSafeImage(user.userImage))
    );
  }

  /***** End Type Guard *****/

}
