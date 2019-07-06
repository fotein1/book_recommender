import { Injectable, Component } from '@angular/core';
import { User } from './User';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  private sessionUrl  = 'http://localhost:8000/api/sessions';
  private registerUrl = 'http://localhost:8000/api/accounts';

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  /**
   * Make a post request to login user
   * 
   * @param user 
   */
  login (user: User) {
    return this.http.post<User>(this.sessionUrl, user, httpOptions)
  }

  /**
   * Make a delete request to logout user
   * 
   * @param user 
   */
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
   * Register a new user
   * 
   * @param user 
   */
  register (user: User) {
    return this.http.post<User>(this.registerUrl, user, httpOptions)
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
