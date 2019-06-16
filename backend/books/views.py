import pandas as pd
import numpy as np
import simplejson as json
from pandas import DataFrame
from rest_framework import generics, mixins
from rest_framework import status
from rest_framework.response import Response
from django.http import HttpResponse, HttpResponseNotFound
from rest_framework.views import APIView
from .models import Book, Book_rating, User_data
from .serializers import  userSerializer, bookSerializer, bookRatingSerializer
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


class bookAPIView(generics.ListAPIView):
    resource_name = 'books'
    serializer_class = bookSerializer
    serializer_class = bookSerializer
    def get_queryset(self):
        request = self.request
        page = request.GET.get('page')
        offset = int(page)*25
        return Book.objects.all()[offset:offset + 25]

class bookRudView(generics.RetrieveUpdateDestroyAPIView):
    resource_name       = 'books'
    lookup_field        = 'ISBN'
    serializer_class    = bookSerializer
    def get_queryset(self):
        return Book.objects.all()

class userBookRecommendationsAPIView(APIView):
    resource_name = 'books'
    serializer_class = bookSerializer
    serializer_class = bookSerializer
    def get_queryset(self):
        return Book.objects.all()


class accountAPIView(generics.CreateAPIView):
    resource_name       = 'accounts'
    serializer_class    = userSerializer
  

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
        username = body['username']
        password = body['password']

        try:
            user = User_data.objects.get(username=username, password=password)
        except:
            return HttpResponseNotFound( "User not found")

        del request.session['member_id']
        return Response(204)