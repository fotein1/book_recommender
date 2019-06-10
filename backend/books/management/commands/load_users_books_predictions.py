import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from books.models import User_Book_prediction

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
        self.recommendItem(self.user_id, ratings_matrix)
        
        
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
        Predict user's rating for an item 
       
        @param obj self           The pointer of class
        @param int user_id        The id of user
        @param int item_id        The id of item
        @param arr ratings_matrix A matrix of ratings
    """
    def predict_itembased(self, user_id, item_id, ratings_matrix):
        prediction = wtd_sum = 0
        user_loc = ratings_matrix.index.get_loc(user_id)
        item_loc = ratings_matrix.columns.get_loc(item_id)
        similarities, indices= self.findksimilaritems(item_id, ratings_matrix) 
        sum_wt = np.sum(similarities) - 1
        product = 1
        for i in range(0, len(indices.flatten())):
            if indices.flatten()[i] == item_loc:
                continue
            else: 
                product = ratings_matrix.iloc[user_loc, indices.flatten()[i]] * (similarities[i])
                wtd_sum = wtd_sum + product
        prediction = int(round(wtd_sum/sum_wt))
                
        if prediction <= 0:
            prediction = 1
        elif prediction > 10:
            prediction = 10
            
        return prediction


    """
        Predict user's rating for an item 
       
        @param obj self           The pointer of class
        @param int user_id        The id of user
        @param int item_id        The id of item
        @param arr ratings_matrix A matrix of ratings
    """
    def recommendItem(self, user_id, ratings_matrix):
        if (user_id not in ratings_matrix.index.values):
            print('user is should be a valid integer')
            return
        else:
            counter = 0
            for i in range(ratings_matrix.shape[1]):
                if (ratings_matrix[str(ratings_matrix.columns[i])][user_id] != 0):
                    item_id = str(ratings_matrix.columns[i])
                    prediction = self.predict_itembased(user_id, item_id , ratings_matrix)
                    self.save_user_book_prediction(user_id, item_id, prediction)
            
                    counter = counter + 1
                    if (counter > self.sample_limit):
                        break
          

    """
        Save user book predictions into db
       
        @param obj self       The pointer of class
        @param int user_id    The id of user
        @param int item_id    The id of item
        @param int prediction The prediction
    """              
    def save_user_book_prediction(self, user_id, item_id, prediction):
        user_book_predicition = User_Book_prediction()
        user_book_predicition.user_id = user_id
        user_book_predicition.ISBN = item_id
        user_book_predicition.prediction = prediction
        user_book_predicition.save()
        