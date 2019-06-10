
import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from books.models import Book

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'
        
    def handle(self, *args, **options):
        books = pd.read_csv('data/BX-Books.csv', sep=';', error_bad_lines=False, encoding="latin-1")
        books.columns = ['ISBN', 'bookTitle', 'bookAuthor', 'yearOfPublication', 'publisher', 'imageUrlS', 'imageUrlM', 'imageUrlL']
        books.apply(self.save_book_from_row, axis=1)

    def save_book_from_row(self, book_row):
        book = Book()
        book.ISBN = book_row['ISBN']
        book.title = book_row['bookTitle']
        book.author = book_row['bookAuthor']
        book.year_of_publication = book_row['yearOfPublication']
        book.publisher = book_row['publisher']
        book.image_url_s = book_row['imageUrlS']
        book.image_url_m = book_row['imageUrlM']
        book.image_url_l = book_row['imageUrlL']
        book.save()
