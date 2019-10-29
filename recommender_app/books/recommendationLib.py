import pandas as pd
import numpy as np
import simplejson as json
from django.http import JsonResponse
from pandas import DataFrame
from rest_framework import generics, mixins
from rest_framework import status
from rest_framework.response import Response
from rest_framework import serializers
from django.http import HttpResponse, HttpResponseNotFound
from rest_framework.views import APIView
from .models import Book, Book_rating, User_data, User_Book_prediction, Book_view, Book_similarities
from .serializers import  userSerializer, bookSerializer, bookRatingSerializer, bookViewSerializer, bookUserPredictionSerializer, bookSimilaritiesSerializer 
from pandas.io.json import json_normalize
from sklearn.neighbors import NearestNeighbors
from scipy.spatial.distance import correlation, cosine
from IPython.display import display, clear_output
from sklearn.metrics import pairwise_distances
from sklearn.metrics import mean_squared_error
from math import sqrt
from contextlib import contextmanager
from django.http import HttpResponse, HttpResponseRedirect
from django.core.paginator import Paginator
from rest_framework.renderers import JSONRenderer
from rest_framework import serializers
from django.db.models import Sum
from django.db.models import F

ROCHIO_INITIAL_QUERY_WEIGHT = 1
ROCHIO_POSITIVE_WEIGHT = 0.75
ROCHIO_NEGATIVE_WEIGHT = 0.15


"""
    Get user predictions
    
    @param int user_id          The id of user
    @param int recommendations  An array with recommendations
    @param boo get_default      True to get the default recommended items

    @return arr                 An array with predictions
"""
def getUserPredictions(user_id, recommendations, get_default):
    predictions = User_Book_prediction.objects.filter(user_id=user_id).order_by('-prediction')[:100]
    if not predictions or get_default == True:
        try:
            ratings = Book_rating.objects.values('ISBN').annotate(score = Sum('rating')).order_by('-score')[:100]
            for rating in ratings:
                result = rating
                try:
                    book   = Book.objects.get(ISBN=result['ISBN'])
                    result['book'] = bookSerializer(book, many=False).data
                except:
                    result['book'] = ''

                if result['book'] != '':
                    recommendations.append(result)
        except:
            return HttpResponseNotFound("Recommendations not found")

    if predictions and get_default == False:
        for prediction in predictions:
            result = bookUserPredictionSerializer(prediction, many=False).data
            try:
                book   = Book.objects.get(ISBN=result['ISBN'])
                result['book'] = bookSerializer(book, many=False).data
            except:
                result['book'] = ''

            if result['book'] != '':
                recommendations.append(result)

    return recommendations

"""
    Get user book views
    
    @param int user_id  The id of user

    @return arr         An array with book views
"""
def getUserBookViews(user_id):
    book_views = []
    try:
        user_book_views = Book_view.objects.filter(user_id=user_id)
    except:
        return HttpResponseNotFound("User has not viewwed books yet")

    if user_book_views:
        for view in user_book_views:
            result = bookViewSerializer(view, many=False).data
            book_views.append(result['ISBN'])
    
    return book_views
    

    
"""
    Adjust predictions based on user feedback
    
    @param arr recommendations An array with recommendations
    @param arr book_views      An array with book views
    @param int user_id         The user id
"""
def adjustPredictionsByUserFeedback(recommendations, book_views, user_id):
    ISBN_positive_similar_ids = []
    ISBN_negative_similar_ids = []

    for recommendation in recommendations:
        counter = 0        
        if recommendation['ISBN'] in book_views:
            counter = counter + 1
            try:
                similar_books = Book_similarities.objects.filter(ISBN=recommendation['ISBN'])
                for book in similar_books:
                    if book['ISBN_similar'] not in ISBN_positive_similar_ids:
                        ISBN_positive_similar_ids.append(book['ISBN_similar'])

                ISBN_positive_similar_ids.append(recommendation['ISBN'])
            except:
                ISBN_positive_similar_ids.append(recommendation['ISBN'])
            
        if recommendation['ISBN'] not in book_views:
            try:
                similar_books = Book_similarities.objects.filter(ISBN=recommendation['ISBN'])
                for book in similar_books:
                    book = bookSimilaritiesSerializer(book, many=False).data
                    if book['ISBN_similar'] not in ISBN_negative_similar_ids:
                        ISBN_negative_similar_ids.append(book['ISBN_similar'])

                ISBN_negative_similar_ids.append(recommendation['ISBN'])
            except:
                ISBN_negative_similar_ids.append(recommendation['ISBN'])

    insert_predictions = False
    user_predictions = User_Book_prediction.objects.filter(user_id=user_id).order_by('-prediction')[:37]
    if not user_predictions:
        insert_predictions = True
       
    if  ISBN_positive_similar_ids:     
        savePositivePredictionsOfRecommendedItems(ISBN_positive_similar_ids, user_id, insert_predictions)
            
    if ISBN_negative_similar_ids:
        saveNegativePredictionsOfRecommendedItems(ISBN_negative_similar_ids, user_id, insert_predictions)
    
        
"""
    Calculate weight = rochio_weight*(sum_of_predictions/predicted_itemss)
    
    @param arr recommendations An array with recommendations
    @param arr book_views      An array with book views
"""
def calculateWeight(rochio_weight, predicted_items_counter, predictions_sum):
    return rochio_weight*predictions_sum/predicted_items_counter


"""
    Adjust the predicted items with a positive weight
    
    @param arr ISBN_positive_similar_ids An array with positive similar ids
    @param int user_id            The user id
    @param boo insert_predictions True if we want to insert predictions, else false 
"""
def savePositivePredictionsOfRecommendedItems(ISBN_positive_similar_ids, user_id, insert_predictions):
    predicted_items_counter = 0
    predictions_sum = 0

    if insert_predictions is False:
        predictions = User_Book_prediction.objects.filter(ISBN__in=ISBN_positive_similar_ids)

        if predictions:
            for prediction in predictions:
                prediction = bookUserPredictionSerializer(prediction, many=False).data
                predicted_items_counter = predicted_items_counter + 1
                predictions_sum = predictions_sum + prediction['prediction']
        
            positive_weight = calculateWeight(ROCHIO_POSITIVE_WEIGHT, predicted_items_counter, predictions_sum)
            if positive_weight <= 0.0:
                positive_weight =  1

            if positive_weight > 10:
                positive_weight =  10
                    
            User_Book_prediction.objects.filter(ISBN__in=ISBN_positive_similar_ids).update(prediction=F('prediction') + abs(positive_weight))

    if insert_predictions is True:
        for item_id in ISBN_positive_similar_ids:
            positive_weight = 1
            user_book_predicition = User_Book_prediction()
            user_book_predicition.user_id = user_id
            user_book_predicition.ISBN = item_id
            user_book_predicition.prediction = positive_weight
            user_book_predicition.save()



"""
    Adjust the predicted items with a negtive weight
    
    @param arr ISBN_negative_similar_ids An array with negative similar ids
    @param int user_id         The user id
    @param boo insert_predictions True if we want to insert predictions, else false 
"""
def saveNegativePredictionsOfRecommendedItems(ISBN_negative_similar_ids, user_id, insert_predictions):
    predicted_items_counter = 0
    predictions_sum = 0

    if insert_predictions is False:
        predictions = User_Book_prediction.objects.filter(ISBN__in=ISBN_negative_similar_ids)
        if predictions:
            for prediction in predictions:
                prediction = bookUserPredictionSerializer(prediction, many=False).data
                predicted_items_counter = predicted_items_counter + 1
                predictions_sum = predictions_sum + prediction['prediction']

            negative_weight = calculateWeight(ROCHIO_NEGATIVE_WEIGHT, predicted_items_counter, predictions_sum)
            if negative_weight == 0.0:
                negative_weight = 1

            User_Book_prediction.objects.filter(ISBN__in=ISBN_negative_similar_ids).update(prediction=F('prediction') - abs(negative_weight))

    if insert_predictions is True:
        for item_id in ISBN_negative_similar_ids:
            positive_weight = 0
            user_book_predicition = User_Book_prediction()
            user_book_predicition.user_id = user_id
            user_book_predicition.ISBN = item_id
            user_book_predicition.prediction = positive_weight
            user_book_predicition.save()
