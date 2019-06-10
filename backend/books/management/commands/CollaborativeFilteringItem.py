#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat May  4 10:55:54 2019

@author: fotinigkiouleka
"""

from BooksDataSet import BooksDataSet
from Recommendation import Recommendation
from surprise import KNNBasic
import heapq
from collections import defaultdict
from operator import itemgetter
        
testSubject = '85'
k = 10
user_id = 11676

data_set = BooksDataSet()

users = data_set.getUsersData()
books = data_set.getBooksData()
ratings = data_set.getRatingsData()

print('Print the loaded data')
data_set.printData()


print('Recommend the books based on rating count')
recommendation = Recommendation()
recommended_items_by_rating = recommendation.getRecommendationsByRatingCounts(ratings, books)
recommendation.printItem(recommended_items_by_rating)

print('Recommend the books based on collaborative user filtering algorithm')
ratings_matrix  =  recommendation.getRecommendationsByCfUser(user_id, ratings)
recommended =  recommendation.recommendItem(user_id)
recommendation.printRecommendations(books, recommended)





