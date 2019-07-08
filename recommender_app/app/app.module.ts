import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BooksComponent } from './books/books.component';
import { FormsModule } from '@angular/forms';
import { MesssagesComponent } from './messsages/messsages.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BooksRecommendationComponent } from './books-recommendation/books-recommendation.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { StorageServiceModule} from 'angular-webstorage-service';
import { AngularWebStorageModule } from 'angular-web-storage';
import { RateBooksComponent } from './rate-books/rate-books.component';

@NgModule({
  declarations: [
    AppComponent,
    BooksComponent,
    MesssagesComponent,
    BookDetailComponent,
    BooksRecommendationComponent,
    NavMenuComponent,
    RateBooksComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule,
    StorageServiceModule,
    AngularWebStorageModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
