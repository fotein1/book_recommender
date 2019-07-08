import { Injectable } from '@angular/core';
import { Book } from './book';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class RateBooksService {

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  private ratBookUrl = 'http://localhost:8000/api/books-rates';

  /**
   * Register a new user
   * 
   * @param user 
   */
  rateBook (data) {
    return this.http.post(this.ratBookUrl, data, httpOptions)
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * 
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
 
  /**
   * 
   * @param message Log a message
   */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
