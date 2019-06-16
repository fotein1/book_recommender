from rest_framework import serializers
from .models import Book, Book_rating, Book_view, User_data

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_data
        fields = (
            'username',
            'password'
        )

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

