/* Module imports */
import { Injectable } from '@angular/core';
import { File, FileEntry, Entry, IFile, FileError, Metadata } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Observable, Observer, forkJoin, from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    public file: File,
    public filePath: FilePath,
    public webview: WebView
  ) { }

  /**
   * Convert a cordova file to a js file
   *
   * @params: file - input cordova file to convert
   *
   * @return: observable of js file buffer or error message
   */
  convertCordovaFileToJSFile(file: IFile): Observable<string | ArrayBuffer> {
    const reader: FileReader = new FileReader();
    reader.readAsArrayBuffer(file);
    return new Observable(
      (observer: Observer<string | ArrayBuffer>): void => {
        reader.onload = (): void => {
          observer.next(reader.result);
          observer.complete();
        };
        reader.onerror = (): void => {
          observer.error(`file reader error: ${reader.error}`);
          observer.complete();
        };
      }
    );
  }

  /**
   * Convert a file entry to a cordova file
   *
   * @params: fileEntry - input device file to convert
   *
   * @return: observable of cordova input file or file error
   */
  convertFileEntrytoCordovaFile(fileEntry: FileEntry): Observable<IFile | FileError> {
    return new Observable((observer: Observer<IFile | FileError>): void => {
      fileEntry.file(
        (file: IFile): void => {
          observer.next(file);
          observer.complete();
        },
        (error: FileError): void => {
          observer.error(error.message);
          observer.complete();
        }
      );
    });
  }

  /**
   * Copy image file from device image gallery to local temporary directory
   *
   * @params: cid - client id of file to be used as new filename
   * @params: path - local directory path
   * @params: fileName - gallery image file name
   * @params: fileExt - file extension to be saved as
   *
   * @return: observable of array with file entry and metadata
   */
  copyFileToLocalTmpDir(
    cid: string,
    path: string,
    fileName: string,
    fileExt: string
  ): Observable<[Entry, Metadata]> {
    return from(this.file.copyFile(path, fileName, this.file.cacheDirectory, cid + fileExt))
      .pipe(
        mergeMap((entry: Entry): Observable<[Entry, Metadata]> => {
          return forkJoin(of(entry), this.getMetadata(entry));
        })
      );
  }

  /**
   * Delete a local file at given path
   *
   * @params: path - file's path
   *
   * @return: observable of null on success or error message on error (does not throw error)
   */
  deleteLocalFile(path: string): Observable<string> {
    return from(this.file.resolveLocalFilesystemUrl(path))
      .pipe(
        mergeMap((entry: FileEntry): Observable<string> => {
          return new Observable((observer: Observer<string>): void => {
            entry.remove(
              (): void => {
                observer.next(null);
                observer.complete();
              },
              (error: FileError): void => {
                console.log('file deletion error', error, path);
                observer.next(error.message);
                observer.complete();
              }
            );
          });
        }),
        catchError((error: any): Observable<string> => {
          console.log('file read error', error);
          return of(error);
        })
      );
  }

  /**
   * Get a device file
   *
   * @params: path - file path to load
   *
   * @return: file buffer or error message
   */
  getLocalFile(path: string): Observable<string | ArrayBuffer> {
    return from(this.file.resolveLocalFilesystemUrl(path))
      .pipe(
        mergeMap((fileEntry: FileEntry): Observable<IFile | FileError> => {
          return this.convertFileEntrytoCordovaFile(fileEntry);
        }),
        mergeMap((file: IFile): Observable<string | ArrayBuffer> => {
          return this.convertCordovaFileToJSFile(file);
        })
      );
  }

  /**
   * Get device local path as url
   *
   * @params: path - file path to convert
   *
   * @return: url version of file path
   */
  getLocalUrl(path: string): string {
    return this.webview.convertFileSrc(path);
  }

  /**
   * Get file entry metadata
   *
   * @params: entry - file entry to query
   *
   * @return: observable of metadata
   */
  getMetadata(entry: Entry): Observable<Metadata> {
    return new Observable((observer: Observer<Metadata>): void => {
      entry.getMetadata(
        (data: Metadata): void => {
          observer.next(data);
          observer.complete();
        },
        (error: any): void => {
          observer.error(error);
          observer.complete();
        }
      );
    });
  }

  /**
   * Get the device's local persistent file directory
   *
   * @params: none
   *
   * @return: device's persistent directory
   */
  getPersistentDirPath(): string {
    return this.file.dataDirectory;
  }

  /**
   * Get the device's local temporary file directory
   *
   * @params: none
   *
   * @return: device's temporary directory
   */
  getTmpDirPath(): string {
    return this.file.cacheDirectory;
  }

  /**
   * Get a file's full device path
   *
   * @params: path - search file path
   *
   * @return: device's native path
   */
  resolveNativePath(path: string): Observable<string> {
    return from(this.filePath.resolveNativePath(path));
  }

}