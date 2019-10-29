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
from .models import Book, Book_rating, User_data, User_Book_prediction
from .serializers import  userSerializer, createUserSerializer, bookSerializer, bookRatingSerializer, bookViewSerializer, bookUserPredictionSerializer
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
from .recommendationLib import getUserBookViews, adjustPredictionsByUserFeedback, getUserPredictions
from django.core.cache import cache
from .tasks import find_recommended_items

class bookAPIView(generics.ListAPIView):
    resource_name = 'books'
    serializer_class = bookSerializer
    serializer_class = bookSerializer
    def get_queryset(self):
        request = self.request
        page = request.GET.get('page')
        offset = int(page)*1000
        return Book.objects.all()[offset:offset + 1000]

class bookRudView(generics.RetrieveUpdateDestroyAPIView):
    resource_name       = 'books'
    lookup_field        = 'ISBN'
    serializer_class    = bookSerializer
    def get_queryset(self):
        return Book.objects.all()

class userBookRecommendationsAPIView(APIView):
    def get(self, request, user_id, *args, **kwargs):
        recommendations = []
        recommendation_expire_cache_name = 'recommendation_expire_' + user_id
        reocmmendations_user_cache_name  = 'recommendations_' + user_id

        recommendations = cache.get(reocmmendations_user_cache_name)
        if recommendation_expire_cache_name in cache and reocmmendations_user_cache_name in cache and recommendations: 
            recommendations = cache.get(reocmmendations_user_cache_name)
        else:
            recommendations = []
            recommendations = getUserPredictions(user_id, recommendations, False)

            try:
                find_recommended_items.delay(user_id, recommendations)
            except:
                return HttpResponseNotFound("Recommendations not found")

            return Response(recommendations)

        if not recommendations:
            recommendations = getUserPredictions(user_id, recommendations, True)

        return Response(recommendations)

class accountAPIView(generics.CreateAPIView):
    resource_name       = 'accounts'
    serializer_class    = createUserSerializer
  
class sessionAPIView(APIView):
    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(request.body)
        username = body['username']
        password = body['password']

        try:
            user = User_data.objects.get(username=username, password=password)
        except:
            return HttpResponseNotFound( "User not found")

        request.session['member_id'] = user.user_id

        return Response({'user_id': user.user_id})


    def delete(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(request.body)
        user_id = body['user_id']

        try:
            user = User_data.objects.get(user_id=user_id)
        except:
            return HttpResponseNotFound( "User not found")

        #del request.session['member_id']
        return Response(204)

class userBookViewsAPIView(generics.CreateAPIView):
    resource_name       = 'user-book-view'
    serializer_class    = bookViewSerializer

class userBookRatesAPIView(APIView):
    def post(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(request.body)
        user_id = body['User_id']
        ISBN = body['ISBN']
        rating = body['rating']
        
        try:
            obj, created = Book_rating.objects.update_or_create(
            User_id=user_id, ISBN=ISBN, rating=rating)
        except:
            return HttpResponseNotFound("Rating process fail")
        
        return Response({'user_id': user_id, 'ISBN': ISBN, 'rating':rating})

