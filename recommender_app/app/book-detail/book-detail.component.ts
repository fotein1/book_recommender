import { Component, OnInit, Input } from '@angular/core';
import { Book } from '../book';
import { BookService }  from '../book.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {
  book: Book[];
  private logged_in:boolean;
  private logged_in_username:string;
  private logged_in_user_id: any;

  @LocalStorage() localValue: Object = { text: `Hello ${+new Date}`};
  @LocalStorage('newKey', 10, 'h') localValue2: Object = { text: `Hello ${+new Date}`};
  @SessionStorage() sessionValue: string = `Hello ${+new Date}`;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private location: Location,
    public local: LocalStorageService,
    public session: SessionStorageService
  ) { }

  ngOnInit(): void {
    this.logged_in = this.get('logged_in');
    this.logged_in_username = this.get('logged_in_username');
    this.logged_in_user_id = this.get('logged_in_user_id');

    this.getBook();
    this.viewBook();
  }

  getBook(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.bookService.getBook(id)
    .subscribe(book => this.book = book);
  }

  viewBook(): void {
    const book_id = this.route.snapshot.paramMap.get('id');
    const user_id = this.get('logged_in_user_id');
    this.bookService.viewBook({'user_id': user_id, 'ISBN': book_id})
      .subscribe(data => console.log(data));
  }

  goBack(): void {
    this.location.back();
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
