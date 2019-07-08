import { Component, OnInit } from '@angular/core';
import { RateBooksService }  from '../rate-books.service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';

@Component({
  selector: 'app-rate-books',
  templateUrl: './rate-books.component.html',
  styleUrls: ['./rate-books.component.css']
})
export class RateBooksComponent implements OnInit {
  private logged_in:boolean;
  private logged_in_username:string;
  private logged_in_user_id: any;
  private rate:any;

  @LocalStorage() localValue: Object = { text: `Hello ${+new Date}`};
  @LocalStorage('newKey', 10, 'h') localValue2: Object = { text: `Hello ${+new Date}`};
  @SessionStorage() sessionValue: string = `Hello ${+new Date}`;

  constructor(
    private route: ActivatedRoute,
    private rateBookService: RateBooksService,
    public local: LocalStorageService,
    public session: SessionStorageService
  ) { }

  ngOnInit() {
    this.rate = '5';
    this.logged_in = this.get('logged_in');
    this.logged_in_username = this.get('logged_in_username');
    this.logged_in_user_id = this.get('logged_in_user_id');

    this.rateBook();
  }

  rateBook(): void {
    const book_id = this.route.snapshot.paramMap.get('id');
    const user_id = this.get('logged_in_user_id');
    
    this.rateBookService.rateBook({'User_id': user_id, 'ISBN': book_id, rating: this.rate})
      .subscribe(data => console.log(data));
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
