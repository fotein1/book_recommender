import { Component, OnInit } from '@angular/core';
import { Book } from '../book';
import { RecommendationBookService } from '../recommendaations.service';

@Component({
  selector: 'app-books-recommendation',
  templateUrl: './books-recommendation.component.html',
  styleUrls: ['./books-recommendation.component.css']
})

export class BooksRecommendationComponent implements OnInit {
  books: Book[];

  constructor(private booksRecommendationService: RecommendationBookService) { }
  
  ngOnInit() {
    this.getBooksRecommendations();
  }

  getBooksRecommendations(): void {
    this.booksRecommendationService.getBooksRecommendations()
      .subscribe(books => this.books = books);
  }
}

