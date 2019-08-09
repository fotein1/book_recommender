import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from books.models import Book_similarities

from surprise import KNNBasic
import sklearn.metrics as metrics
from sklearn.neighbors import NearestNeighbors
from scipy.spatial.distance import correlation, cosine
import ipywidgets as widgets
from IPython.display import display, clear_output
from sklearn.metrics import pairwise_distances
from sklearn.metrics import mean_squared_error
from math import sqrt
import sys, os
from contextlib import contextmanager

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'
    metric = 'cosine'
    k = 6
    sample_limit = 10000
    user_id = 183
        
    def handle(self, *args, **options):
        ratings = pd.read_csv('data/BX-Book-Ratings.csv', sep=';', error_bad_lines=False, encoding="latin-1")
        ratings.columns = ['userID', 'ISBN', 'bookRating']

        #Reduce the dataset size, take into account users who have rated at least 100 books
        #and books which have at least 100 ratings
        counts1 = ratings['userID'].value_counts()
        ratings_explicit = ratings[ratings['userID'].isin(counts1[counts1 >= 100].index)]
        counts = ratings_explicit['bookRating'].value_counts()
        ratings_explicit = ratings_explicit[ratings_explicit['bookRating'].isin(counts[counts >= 100].index)]

        #Generate a user-item ratings matrix from the ratings table.
        ratings_matrix = ratings_explicit.pivot(index='userID', columns='ISBN', values='bookRating')
        for col in ratings_matrix:
            ratings_matrix[col].fillna(0, inplace=True)
        self.calculateSimilarBooks(ratings_matrix)


    """
        Calculate similarities of books
        
        @param obj self           The pointer of class
    """
    def calculateSimilarBooks(self, ratings_matrix):
        counter = 0
        for i in range(ratings_matrix.shape[1]):
            item_id = str(ratings_matrix.columns[i])
            similarities, indices= self.findksimilaritems(item_id, ratings_matrix) 
            for i in range(0, len(indices.flatten())):
                if (similarities[i] != 0):
                    index = indices.flatten()[i]            
                    similar_item_id = str(ratings_matrix.columns[index])
                    self.saveSimilarBooks(item_id,similar_item_id)
                counter = counter + 1
                if (counter > self.sample_limit):
                    break
            

    """
        Find similarities bettween items
       
        @param obj self           The pointer of class
        @param int item_id        The id of item
        @param arr ratings_matrix The matrix of ratings
    """
    def findksimilaritems(self, item_id, ratings_matrix):
        similarities=[]
        indices=[]
        ratings = ratings_matrix.T
        loc = ratings.index.get_loc(item_id)
        model_knn = NearestNeighbors(metric = 'cosine', algorithm = 'brute') 
        model_knn.fit(ratings)
        distances, indices = model_knn.kneighbors(ratings.iloc[loc, :].values.reshape(1, -1), n_neighbors = self.k + 1)
        similarities = 1-distances.flatten()
        
        return similarities,indices


    """
        Save user book predictions into db
       
        @param obj self       The pointer of class
        @param int item_id    The id of item
        @param int similar_id The similar id
    """              
    def saveSimilarBooks(self, item_id, similar_id):
        book_similarities = Book_similarities()
        book_similarities.ISBN = item_id
        book_similarities.ISBN_similar = similar_id
        book_similarities.save()
        