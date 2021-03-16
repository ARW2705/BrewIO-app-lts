/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, defaultIfEmpty, mergeMap, map, tap } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Default imports */
import { defaultEnglish } from '../../shared/defaults/default-units';
import { defaultImage } from '../../shared/defaults/default-image';

/* utility imports */
import { getId, hasDefaultIdType } from '../../shared/utility-functions/id-helpers';

/* Interface imports */
import { Image, ImageRequestFormData, ImageRequestMetadata } from '../../shared/interfaces/image';
import { LoginCredentials } from '../../shared/interfaces/login-credentials';
import { SelectedUnits } from '../../shared/interfaces/units';
import { SyncMetadata, SyncResponse } from '../../shared/interfaces/sync';
import { User } from '../../shared/interfaces/user';
import { UserResponse } from '../../shared/interfaces/user-response';

/* Provider imports */
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { ImageService } from '../image/image.service';
import { PreferencesService } from '../preferences/preferences.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';
import { SyncService } from '../sync/sync.service';
import { ToastService } from '../toast/toast.service';


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
    public event: EventService,
    public imageService: ImageService,
    public preferenceService: PreferencesService,
    public httpError: HttpErrorService,
    public storageService: StorageService,
    public syncService: SyncService,
    public toastService: ToastService
  ) {
    console.log('user service');
  }

  /**
   * Request server check json web token validity
   *
   * @params: none
   *
   * @return: Observable of UserResponse
   */
  checkJWToken(): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${BASE_URL}/${API_VERSION}/users/checkJWToken`
    )
    .pipe(
      catchError((error: HttpErrorResponse): Observable<never> => {
        return this.httpError.handleError(error);
      })
    );
  }

  /**
   * Set user subject data to default values, clear user from ionic storage,
   * and emit event to call any other stored values to be cleared
   *
   * @params: none
   * @return: none
   */
  clearUserData(): void {
    const _defaultEnglish: SelectedUnits = defaultEnglish();
    const _defaultImage: Image = defaultImage();
    this.user$.next({
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
      preferredUnitSystem: _defaultEnglish.system,
      units: _defaultEnglish,
      breweryLabelImage: _defaultImage,
      userImage: _defaultImage
    });

    this.storageService.removeUser();
    this.event.emit('clear-data');
  }

  /**
   * Retrieve user authentication json web token
   *
   * @params: none
   *
   * @return: user's auth token
   */
  getToken(): string {
    return this.user$.value.token;
  }

  /**
   * Get the user subject
   *
   * @params: none
   *
   * @return: user behavior subject
   */
  getUser(): BehaviorSubject<User> {
    return this.user$;
  }

  /**
   * Check if user is logged in
   *
   * @params: none
   *
   * @return: true if an auth token is present and not an empty string
   */
  isLoggedIn(): boolean {
    return this.getUser().value.token !== undefined
      && this.getUser().value.token !== '';
  }

  /**
   * Load user data from ionic storage. If user is not logged in, set app for
   * offline mode. Otherwise, check if json web token is valid. Remove stored
   * token if no longer valid. Finally, emit event to request other data
   *
   * @params: none
   * @return: none
   */
  loadUserFromStorage(): void {
    this.storageService.getUser()
      .subscribe(
        (user: User): void => {
          this.user$.next(user);
          if (this.isLoggedIn()) {
            this.checkJWToken()
              .subscribe(
                (jwtResponse: UserResponse): void => console.log(jwtResponse.status),
                (error: string): void => {
                  console.log(error);
                  if (error.includes('401')) {
                    const removedToken: User = this.getUser().value;
                    removedToken.token = undefined;
                    this.user$.next(removedToken);
                    this.toastService.presentErrorToast('Login has expired, please log in again');
                  }
                }
              );
          } else {
            this.connectionService.setOfflineMode(true);
          }
          console.log('emit init recipes');
          this.event.emit('init-recipes');
          this.preferenceService.setUnits(
            user.preferredUnitSystem,
            user.units
          );
        },
        (error: string): void => console.log(`User load error: ${error}`)
      );
  }

  /**
   * Log user in with username and password. Update user subject with response.
   * If user selected to remember login, store user data in ionic storage
   *
   * @params: user - contains username string, password string, and remember boolean
   * @params: onSignupSync - true if logging in after initial sign up
   *
   * @return: observable with login response user data
   */
  logIn(user: LoginCredentials, onSignupSync: boolean): Observable<User> {
    return this.http.post(`${BASE_URL}/${API_VERSION}/users/login`, user)
      .pipe(
        map((response: UserResponse): User => {
          this.user$.next(response.user);
          this.connectionService.setOfflineMode(false);

          if (onSignupSync) {
            this.event.emit('sync-recipes-on-signup');
          } else {
            this.event.emit('init-recipes');
          }

          this.preferenceService.setUnits(
            response.user.preferredUnitSystem,
            response.user.units
          );

          if (user.remember) {
            this.storageService.setUser(response.user)
              .subscribe(
                (): void => console.log('stored user data'),
                (error: string): void => console.log(`User store error: ${error}`)
              );
          }

          return response.user;
        }),
        tap((): void => {
          this.syncOnConnection()
            .subscribe(
              (): void => console.log('user sync successful'),
              (error: string): void => console.log('User login error', error)
            );
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      );
  }

  /**
   * Clear stored user data on logout and set connection to offline
   *
   * @params: none
   * @return: none
   */
  logOut(): void {
    this.connectionService.setOfflineMode(true);
    this.clearUserData();
  }

  /**
   * Copy data from updated user or user values to current user
   *
   * @params: userUpdate - object with new user values
   * @params: [inputUser] - optional given user to apply new values to;
   * use current user if input not given
   *
   * @return: none
   */
  mapUserData(userUpdate: User | object, inputUser?: User): void {
    const user$: BehaviorSubject<User> = this.getUser();
    const user: User = inputUser || user$.value;

    for (const key in userUpdate) {
      if (userUpdate.hasOwnProperty(key)) {
        if (user[key] && userUpdate[key] && typeof userUpdate[key] === 'object') {
          for (const innerKey in userUpdate[key]) {
            if (userUpdate[key].hasOwnProperty(innerKey)) {
              user[key][innerKey] = userUpdate[key][innerKey];
            }
          }
        } else {
          user[key] = userUpdate[key];
        }
      }
    }

    if (!inputUser) {
      user$.next(user);
    }
  }

  /**
   * Sign up a new user and login if successful
   *
   * @params: user - user must contain at least a username, password, and email
   *
   * @return: if signup successful, return observable of login response,
   *          else signup response
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
          .subscribe((): void => console.log('Signup successful; log in successful'));
        }),
        catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        })
      );
  }

  /**
   * Update user profile
   *
   * @params: user - object with new user profile data
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
          user$.next(user);
          return of(user);
        })
      );
  }

  /**
   * Update stored user with current user
   *
   * @params: none
   * @return: none
   */
  updateUserStorage(): void {
    this.storageService.setUser(this.getUser().value)
      .subscribe(
        () => console.log('user data stored'),
        (error: string): void => console.log(`user store error: ${error}`)
      );
  }

  /***** Background Server Request *****/

  /**
   * Check if able to send an http request
   *
   * @params: userId - the user's id to check
   *
   * @return: true if connected to network, logged in, and has a server id
   */
  canSendRequest(userId: string): boolean {
    return this.connectionService.isConnected() && this.isLoggedIn() && !hasDefaultIdType(userId);
  }

  /**
   * Set up image storage function calls to persistently store image
   * If an existing persistent image is to be overridden, provide new path
   *
   * @params: user - contains the image(s)
   * @params: replacementPaths - object with original paths for overriding persistent image
   *
   * @return: array of persistent image observables
   */
  composeImageStoreRequests(user: User, replacementPaths: object = {}): Observable<Image>[] {
    const storeImages: Observable<Image>[] = [];

    let imageName = 'userImage';
    let image: Image = user[imageName];

    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeFileToLocalDir(image, replacementPaths[imageName]));
    }

    imageName = 'breweryLabelImage';
    image = user[imageName];

    if (image && image.hasPending) {
      storeImages.push(this.imageService.storeFileToLocalDir(image, replacementPaths[imageName]));
    }

    return storeImages;
  }

  /**
   * Set up image upload request data
   *
   * @params: user - user update object
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
   * @params: user - user update object
   * @params: shouldResolveError - true if error should return the error response as an observable
   * or false if error should be handled as an error
   *
   * @return: observable of User or HttpErrorResponse
   */
  configureBackgroundRequest(
    user: User | object,
    shouldResolveError: boolean
  ): Observable<User | HttpErrorResponse> {
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
        catchError((error: HttpErrorResponse): Observable<HttpErrorResponse> => {
          if (shouldResolveError) {
            return of(error);
          }
          return this.httpError.handleError(error);
        })
      );
  }

  /**
   * Get a server update object for the user
   *
   * @params: user - the user as the basis for the update - may have pre-saved updated values
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
   * Perform background server http request
   *
   * @params: user - the user to push to server
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
        (error: string): void => {
          console.log('User: background patch request error', error);
          this.toastService.presentErrorToast('User profile failed to save to server');
        }
      );
  }

  /***** End Background Server Request *****/


  /***** Server Sync *****/

  /**
   * Add a sync flag for a recipe
   *
   * @params: method - options: 'create', 'update', or 'delete'
   * @params: docId - document id to apply sync
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
   * Process all sync flags on reconnect;
   *
   * @params: none
   * @return: none
   */
  syncOnConnection(): Observable<boolean> {
    const user$: BehaviorSubject<User> = this.getUser();
    const user: User = user$.value;

    return this.syncService.sync('user', [this.configureBackgroundRequest(user, true)])
      .pipe(
        map((response: SyncResponse<User>): boolean => {
          user$.next(<User>response.successes[0]);
          return true;
        })
      );
  }

}
