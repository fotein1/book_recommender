from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
  ISBN       = models.CharField(unique=True, primary_key=True, max_length=255)
  title      = models.CharField(max_length=255)
  author     = models.CharField(max_length=255)
  year_of_publication = models.CharField(max_length=255)
  publisher   = models.CharField(max_length=255)
  image_url_s = models.CharField(max_length=255)
  image_url_m = models.CharField(max_length=255)
  image_url_l = models.CharField(max_length=255)

class User_data(models.Model):
  user_id = models.IntegerField(unique=True, primary_key=True)
  username = models.CharField(max_length=255)
  password = models.CharField(max_length=255)

class Book_rating(models.Model):
  User_id = models.IntegerField()
  ISBN    = models.CharField(max_length=255)
  rating  = models.IntegerField()

class Book_view(models.Model):
  user_id = models.IntegerField()
  ISBN    = models.CharField(max_length=255)

class User_Book_prediction(models.Model):
  user_id = models.IntegerField()
  ISBN    = models.CharField(max_length=255)
  prediction = models.IntegerField()
