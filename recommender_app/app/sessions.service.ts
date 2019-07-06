import { Injectable, Component } from '@angular/core';
import { User } from './User';
import { BOOKS } from './mock-books';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap} from 'rxjs/operators';
import { UseExistingWebDriver } from 'protractor/built/driverProviders';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private sessionUrl = 'http://localhost:8000/api/sessions';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  /** PUT: update the hero on the server */
  login (user: User) {
    return this.http.post<User>(this.sessionUrl, user, httpOptions)
  }

  logout (user: any) {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: user
    }
    
    return this.http.delete(this.sessionUrl, options)
  }


   /**
   * Handle Http operation that failed.
   * Let the app continue.
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
 
  /** Log a message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
}
