import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from books.models import Book_rating

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'
        
    def handle(self, *args, **options):
        ratings = pd.read_csv('data/BX-Book-Ratings.csv', sep=';', error_bad_lines=False, encoding="latin-1")
        ratings.columns = ['userID', 'ISBN', 'bookRating']
        ratings.apply(self.save_rating_from_row, axis=1)

    def save_rating_from_row(self, rating_row):
        rating = Book_rating()
        rating.User_id = rating_row['userID']
        rating.ISBN = rating_row['ISBN']
        rating.rating = rating_row['bookRating']
        rating.save()