#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed May  1 19:41:09 2019

@author: fotinigkiouleka
"""

import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader


class BooksDataSet:
    usersPath   = 'data/BX-Users.csv'
    booksPath   = 'data/BX-Books.csv'
    ratingsPath = 'data/BX-Book-Ratings.csv'
    users = {}
    books = {}
    ratings = {}
    
    def getUsersData(self):
        self.users = pd.read_csv(self.usersPath, sep=';', error_bad_lines=False, encoding="latin-1")
        self.users.columns = ['userID', 'Location', 'Age']
        
        return self.users

    def getBooksData(self):
        self.books = pd.read_csv(self.booksPath, sep=';', error_bad_lines=False, encoding="latin-1")
        self.books.columns = ['ISBN', 'bookTitle', 'bookAuthor', 'yearOfPublication', 'publisher', 'imageUrlS', 'imageUrlM', 'imageUrlL']
        
        return self.books
    
    def getRatingsData(self):
        self.ratings = pd.read_csv(self.ratingsPath, sep=';', error_bad_lines=False, encoding="latin-1")
        self.ratings.columns = ['userID', 'ISBN', 'bookRating']
        
        return self.ratings
    
    def printData(self):
        print(self.users.shape)
        print(list(self.users.columns))
        
        print(self.books.shape)
        print(list(self.books.columns))
        
        print(self.ratings.shape)
        print(list(self.ratings.columns))


