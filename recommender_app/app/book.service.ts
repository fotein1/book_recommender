import { Injectable } from '@angular/core';
import { Book } from './book';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  private booksUrl       = 'http://localhost:8000/api/books?page=1';
  private bookDetailsUrl = 'http://localhost:8000/api/books/';
  private bookViewUrl    = 'http://localhost:8000/api/books-views';

  /**
   * Make a request to get books
   */
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.booksUrl)
      .pipe(
        catchError(this.handleError('getBooks', []))
      )
  }

  /**
   * Make a request to get the details of book
   * 
   * @param ISBN 
   */
  getBook(ISBN: string): Observable<Book[]> {
    return this.http.get<Book[]>(this.bookDetailsUrl + ISBN)
      .pipe(
        catchError(this.handleError('getBook', []))
      )
  }

  /**
   * Make a request to increase the views for the specific book
   * s
   * @param data 
   */
  viewBook(data: any) {
    console.log(data);
    return this.http.post(this.bookViewUrl, data, httpOptions)
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /**
   * Log a mesage
   * 
   * @param message 
   */
  private log(message: string) {
    this.messageService.add('BookService: ${message}');
  }
}
