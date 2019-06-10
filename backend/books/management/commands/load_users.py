
import pandas as pd
import numpy as np
from surprise import Dataset
from surprise import Reader
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from books.models import User_data

class Command(BaseCommand):
    help = 'Closes the specified poll for voting'
        
    def handle(self, *args, **options):
        users = pd.read_csv('data/BX-Users.csv', sep=';', error_bad_lines=False, encoding="latin-1")
        users.columns = ['userID', 'Location', 'Age']
        users.apply(self.save_user_from_row, axis=1)

    def save_user_from_row(self, user_row):
        user = User_data()
        user.id = user_row['userID']
        user.Username = 'test'
        user.Password = 'test'
        user.save()
    
