#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Apr  7 19:42:58 2019

@author: fotinigkiouleka
"""
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

global k,metric
k=4
metric='cosine'

books = [
     {
        "ISBN": 2005018,
        "title": "Clara Callan",
        "author": "Richard Bruce Wright",
        "year_of_publication": "2001",
        "publisher": "HarperFlamingo Canada",
        "image_url_s": "http://images.amazon.com/images/P/0002005018.01.THUMBZZZ.jpg",
        "image_url_m": "http://images.amazon.com/images/P/0002005018.01.MZZZZZZZ.jpg",
        "image_url_l": "http://images.amazon.com/images/P/0002005018.01.LZZZZZZZ.jpg"
    },
    {
        "ISBN": 60973129,
        "title": "Decision in Normandy",
        "author": "Carlo D\\'Este",
        "year_of_publication": "1991",
        "publisher": "HarperPerennial",
        "image_url_s": "http://images.amazon.com/images/P/0060973129.01.THUMBZZZ.jpg",
        "image_url_m": "http://images.amazon.com/images/P/0060973129.01.MZZZZZZZ.jpg",
        "image_url_l": "http://images.amazon.com/images/P/0060973129.01.LZZZZZZZ.jpg"
    },
    {
        "ISBN": 195153448,
        "title": "Classical Mythology",
        "author": "Mark P. O. Morford",
        "year_of_publication": "2002",
        "publisher": "Oxford University Press",
        "image_url_s": "http://images.amazon.com/images/P/0195153448.01.THUMBZZZ.jpg",
        "image_url_m": "http://images.amazon.com/images/P/0195153448.01.MZZZZZZZ.jpg",
        "image_url_l": "http://images.amazon.com/images/P/0195153448.01.LZZZZZZZ.jpg"
    },
    {
        "ISBN": 374157065,
        "title": "Flu: The Story of the Great Influenza Pandemic of 1918 and the Search for the Virus That Caused It",
        "author": "Gina Bari Kolata",
        "year_of_publication": "1999",
        "publisher": "Farrar Straus Giroux",
        "image_url_s": "http://images.amazon.com/images/P/0374157065.01.THUMBZZZ.jpg'",
        "image_url_m": "http://images.amazon.com/images/P/0374157065.01.MZZZZZZZ.jpg",
        "image_url_l": "http://images.amazon.com/images/P/0374157065.01.LZZZZZZZ.jpg"
    },
    {
        "ISBN": 393045218,
        "title": "The Mummies of Urumchi",
        "author": "E. J. W. Barber",
        "year_of_publication": "1999",
        "publisher": "W. W. Norton &amp; Company",
        "image_url_s": "http://images.amazon.com/images/P/0393045218.01.THUMBZZZ.jpg",
        "image_url_m": "http://images.amazon.com/images/P/0393045218.01.MZZZZZZZ.jpg",
        "image_url_l": "http://images.amazon.com/images/P/0393045218.01.LZZZZZZZ.jpg"
    },
    {
        "ISBN": 399135782,
        "title": "The Kitchen God\\'s Wife",
        "author": "Amy Tan",
        "year_of_publication": "1991",
        "publisher": "Putnam Pub Group",
        "image_url_s": "http://images.amazon.com/images/P/0399135782.01.THUMBZZZ.jpg",
        "image_url_m": "http://images.amazon.com/images/P/0399135782.01.MZZZZZZZ.jpg",
        "image_url_l": "http://images.amazon.com/images/P/0399135782.01.MZZZZZZZ.jpg','http://images.amazon.com/images/P/0399135782.01.LZZZZZZZ.jpg"
    }
]

from pandas.io.json import json_normalize
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
books = pd.DataFrame.from_dict(json_normalize(books), orient='columns')
print(books)

user = {
        "id": 1,
        "password": "pbkdf2_sha256$150000$hkr4rsojFADj$c+xrrA9RQsOt7kup176+M75wMwDxvIX2dFZNyzC+6TI=",
        "last_login": "2019-02-10T19:14:26.615873Z",
        "username": "admin",
        "first_name": "",
        "last_name": "",
        "email": "admin@test.com",
        "date_joined": "2019-01-26T21:50:08.847657Z",
        "groups": [],
        "user_permissions": []
    }

user = pd.DataFrame.from_dict(json_normalize(user), orient='columns')
print(user)


ratings = [{
        "User_id": 1,
        "ISBN": 2005018,
        "rating": 3
    },
    {
        "User_id": 1,
        "ISBN": 195153448,
        "rating": 5
    }
]

# Recommend books based on popularity
ratings = pd.DataFrame.from_dict(json_normalize(ratings), orient='columns')
print(ratings)

rating_count = pd.DataFrame(ratings.groupby('ISBN')['rating'].count())
print(rating_count);
top10 = rating_count.sort_values('rating', ascending=False).head(10)


print ("Following books are recommended")
top10.merge(books, left_index= True, right_on = 'ISBN')

# cOLLABORATIVE FILTERING
ratings_matrix = ratings.pivot(index="User_id", columns="ISBN", values="rating")
User_id = ratings_matrix.matrix
#ISBN = ratings_matrix.columns

#print(User_id);
print(ratings_matrix.shape)
#ratings_matrix.head()

def findksimilarusers(user_id, ratings, metric = metric, k=k):
    similarities = []
    indices = []
    model_knn = NearestNeighbors(metric = metric, algorithm = 'brute')
    model_knn.fit(ratings)
    loc = ratings.index.get_loc(user_id)
    distances, indices = model_knn.kneighbors(ratings.iloc[loc, :].values.reshape(1, -1), n_neighbors = k + 1)
    similarities = 1 - distances.flatten()
    
    return similarities.indices


    