#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat May  4 16:54:55 2019

@author: fotinigkiouleka
"""

import pandas as pd
import numpy as np
from surprise import KNNBasic
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import sklearn.metrics as metrics
import numpy as np
from sklearn.neighbors import NearestNeighbors
from scipy.spatial.distance import correlation, cosine
import ipywidgets as widgets
from IPython.display import display, clear_output
from sklearn.metrics import pairwise_distances
from sklearn.metrics import mean_squared_error
from math import sqrt
import sys, os
from contextlib import contextmanager


class Recommendation:
    recommended_items = {}
    ratings_explicit  = {}
    ratings_matrix    = {}
    metric = 'cosine'
    k = 6
    
    def getRecommendationsByRatingCounts(self,ratings, books):
        self.recommended_items = pd.DataFrame(ratings.groupby('ISBN')['bookRating'].count())
        self.recommended_items = self.recommended_items.sort_values('bookRating', ascending=False)
        self.recommended_items = self.recommended_items.merge(books, left_index = True, right_on = 'ISBN')
        
        return self.recommended_items
    
    def getRecommendationsByCfUser(self, user_id, ratings):
        self.prepareSampleDataForRecommendations(ratings)
        
        return self.generateCfUserItemRatingsMatrix()
        #return self.findksimilarusers()
        
    """
       Reduce the dataset size, take into account users who have rated at least 100 books
       and books which have at least 100 ratings
       
       @param obj self    The pointer of class
       @param obj ratings An object with ratings
    """
    def prepareSampleDataForRecommendations(self, ratings):
        counts1 = ratings['userID'].value_counts()
        self.ratings_explicit = ratings[ratings['userID'].isin(counts1[counts1 >= 100].index)]
        counts = self.ratings_explicit['bookRating'].value_counts()
        self.ratings_explicit = self.ratings_explicit[self.ratings_explicit['bookRating'].isin(counts[counts >= 100].index)]
    
    """
       Generate a user-item ratings matrix from the ratings table.
    """           
    def generateCfUserItemRatingsMatrix(self):
        self.ratings_matrix = self.ratings_explicit.pivot(index='userID', columns='ISBN', values='bookRating')
        userId = self.ratings_matrix.index
        ISBN = self.ratings_matrix.columns
        for col in self.ratings_matrix:
            self.ratings_matrix[col].fillna(0, inplace=True)
        return self.ratings_matrix
            
    def findksimilaritems(self, item_id):
        similarities=[]
        indices=[]
        ratings = self.ratings_matrix.T
        loc = ratings.index.get_loc(item_id)
        model_knn = NearestNeighbors(metric = 'cosine', algorithm = 'brute') 
        model_knn.fit(ratings)
        distances, indices = model_knn.kneighbors(ratings.iloc[loc, :].values.reshape(1, -1), n_neighbors = self.k + 1)
        similarities = 1-distances.flatten()
        
        return similarities,indices
    
    def predict_userbased(self, user_id, item_id):
        prediction=0
        user_loc = self.ratings_matrix.index.get_loc(user_id)
        item_loc = self.ratings_matrix.columns.get_loc(item_id)
        similarities, indices=self.findksimilarusers(user_id) #similar users based on cosine similarity
        mean_rating = self.ratings_matrix.loc[user_id,:].mean() #to adjust for zero based indexing
        sum_wt = np.sum(similarities)-1
        product=1
        wtd_sum = 0 
        
        for i in range(0, len(indices.flatten())):
            if indices.flatten()[i]+1 == user_loc:
                continue;
            else: 
                ratings_diff = self.ratings_matrix.iloc[indices.flatten()[i],item_loc]-np.mean(self.ratings_matrix.iloc[indices.flatten()[i],:])
                product = ratings_diff * (similarities[i])
                wtd_sum = wtd_sum + product
        
        if prediction <= 0:
            prediction = 1
        elif prediction > 10:
            prediction = 10
        
        prediction = int(round(mean_rating + (wtd_sum/sum_wt)))
        return prediction
    
    def predict_itembased(self, user_id, item_id):
        prediction = wtd_sum = 0
        user_loc = self.ratings_matrix.index.get_loc(user_id)
        item_loc = self.ratings_matrix.columns.get_loc(item_id)
        similarities, indices=self.findksimilaritems(item_id) 
        sum_wt = np.sum(similarities) - 1
        product = 1
        for i in range(0, len(indices.flatten())):
            if indices.flatten()[i] == item_loc:
                continue;
            else: 
                product = self.ratings_matrix.iloc[user_loc, indices.flatten()[i]] * (similarities[i])
                wtd_sum = wtd_sum + product
        prediction = int(round(wtd_sum/sum_wt))
                
        if prediction <= 0:
            prediction = 1
        elif prediction > 10:
            prediction = 10
            
        return prediction


        
    def recommendItem(self, user_id):
        if (user_id not in self.ratings_matrix.index.values) or type(user_id) is  not int:
            print('user is should be a valid integer')
            return
        else:
        
            prediction = []
            counter = 0
            for i in range(self.ratings_matrix.shape[1]):
                print(counter)
                if (self.ratings_matrix[str(self.ratings_matrix.columns[i])][user_id] != 0):
                    prediction.append(self.predict_itembased(user_id, str(self.ratings_matrix.columns[i])))
                    counter = counter + 1
                else:
                    prediction.append(-1)
                    counter = counter + 1
                print('nope')
                    
                    

            prediction = pd.Series(prediction)
            prediction = prediction.sort_values(ascending=False)
        
            return prediction[:10]
        
    def printRecommendations(self, books, recommended):
        for i in range(len(recommended)):
            print ('{0}. {1}'.format(i+1,books.bookTitle[recommended.index[i]].encode('utf-8')))
        
    
    def printItem(self, item):
        print(item)