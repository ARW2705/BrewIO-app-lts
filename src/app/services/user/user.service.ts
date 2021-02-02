/* Module imports */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/* Constants imports */
import { API_VERSION } from '../../shared/constants/api-version';
import { BASE_URL } from '../../shared/constants/base-url';

/* Default imports */
import { defaultEnglish } from '../../shared/defaults/default-units';

/* Interface imports */
import { LoginCredentials } from '../../shared/interfaces/login-credentials';
import { SelectedUnits } from '../../shared/interfaces/units';
import { User } from '../../shared/interfaces/user';
import { UserResponse } from '../../shared/interfaces/user-response';

/* Provider imports */
import { ConnectionService } from '../connection/connection.service';
import { EventService } from '../event/event.service';
import { PreferencesService } from '../preferences/preferences.service';
import { HttpErrorService } from '../http-error/http-error.service';
import { StorageService } from '../storage/storage.service';


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
    public preferenceService: PreferencesService,
    public httpError: HttpErrorService,
    public storageService: StorageService
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
      units: _defaultEnglish
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
                (jwtResponse: UserResponse): void => {
                  console.log(jwtResponse.status);
                },
                (error: string): void => {
                  // TODO: feedback to login again
                  console.log(error);
                  if (error.includes('401')) {
                    const removedToken: User = this.getUser().value;
                    removedToken.token = undefined;
                    this.user$.next(removedToken);
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
                (error: string): void => {
                  console.log(`User store error: ${error}`);
                }
              );
          }

          return response.user;
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
   * Sign up a new user and login if successful
   *
   * @params: user - user must contain at least a username, password, and email
   *
   * @return: if signup successful, return observable of login response,
   *          else signup response
   */
  signUp(user: object): Observable<UserResponse> {
    // Attach required user fields
    user['preferredUnitSystem'] = this.preferenceService.preferredUnitSystem;
    user['units'] = this.preferenceService.units;

    return this.http.post(`${BASE_URL}/${API_VERSION}/users/signup`, user)
      .pipe(
        map((response: UserResponse): UserResponse => {
          this.logIn(
            {
              username: user['username'],
              password: user['password'],
              remember: true
            },
            true
          )
          .subscribe((_user: User): void => {
            console.log(
              'Signup successful; log in successful', user['username']
            );
          });
          return response;
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

    for (const key in userUpdate) {
      if (user.hasOwnProperty(key)) {
        user[key] = userUpdate[key];
      }
    }

    user$.next(user);
    this.storageService.setUser(user)
      .subscribe(() => console.log('user data stored'));

    if (this.isLoggedIn()) {
      return this.http.patch<User>(`${BASE_URL}/${API_VERSION}/users/profile`, user)
        .pipe(catchError((error: HttpErrorResponse): Observable<never> => {
          return this.httpError.handleError(error);
        }));
    }
    return of(null);
  }

}
