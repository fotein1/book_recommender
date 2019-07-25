import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../book';
import { RecommendationBookService } from '../recommendaations.service';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';

@Component({
  selector: 'app-books-recommendation',
  templateUrl: './books-recommendation.component.html',
  styleUrls: ['./books-recommendation.component.css']
})

export class BooksRecommendationComponent implements OnInit {
  private logged_in:boolean;
  private logged_in_username:string;
  private logged_in_user_id: any;
  private rate:any;
  books: Book[];

  @LocalStorage() localValue: Object = { text: `Hello ${+new Date}`};
  @LocalStorage('newKey', 10, 'h') localValue2: Object = { text: `Hello ${+new Date}`};
  @SessionStorage() sessionValue: string = `Hello ${+new Date}`;

  constructor(
    private route: ActivatedRoute,
    private booksRecommendationService: RecommendationBookService,
    public local: LocalStorageService,
    public session: SessionStorageService
  ) { }
  
  ngOnInit() {
    this.logged_in = this.get('logged_in');
    this.logged_in_username = this.get('logged_in_username');
    this.logged_in_user_id = this.get('logged_in_user_id');

    this.getBooksRecommendations();
  }

  getBooksRecommendations(): void {
    const user_id = this.get('logged_in_user_id');

    this.booksRecommendationService.getBooksRecommendations(user_id)
      .subscribe(books => this.books = books);
  }

  /**
   * Get an item from local storage
   * 
   * @param key 
   */
  get(key) 
  {
    return this.local.get(key);
  }
}

