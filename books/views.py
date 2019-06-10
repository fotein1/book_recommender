import pandas as pd
import numpy as np
from pandas import DataFrame
from rest_framework import generics, mixins
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Book, Book_rating, User
from .serializers import  userSerializer, bookSerializer, bookRatingSerializer
from pandas.io.json import json_normalize
import matplotlib.pyplot as plt
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

class bookAPIView(generics.ListAPIView):
    resource_name = 'books'
    serializer_class = bookSerializer
    serializer_class = bookSerializer
    def get_queryset(self):
        return Book.objects.all()

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
