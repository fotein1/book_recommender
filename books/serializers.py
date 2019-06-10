from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Book_rating, Book_view

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('__all__')

class bookSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Book
        fields = (
            'ISBN',
            'title',
            'author',
            'year_of_publication',
            'publisher',
            'image_url_s',
            'image_url_m',
            'image_url_l'
        )

class bookRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book_rating
        fields = (
            'User_id',
            'ISBN',
            'rating'
        )

class bookViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book_view
        fields = (
            'User_id',
            'ISBN'
        )

