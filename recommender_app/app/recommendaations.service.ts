import { Injectable } from '@angular/core';
import { Book } from './book';
import { Observable, of } from 'rxjs';
import { MessageService } from './message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecommendationBookService {

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  private recommendationsUrl = 'http://localhost:8000/api/books-recommendations/users/';

  private log(message: string) {
    this.messageService.add('RecommendationBookService: ${message}');
  }

  getBooksRecommendations(user_id:any): Observable<Book[]> {
    return this.http.get<Book[]>(this.recommendationsUrl + user_id)
      .pipe(
        catchError(this.handleError('getBooks', []))
      )
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
}
