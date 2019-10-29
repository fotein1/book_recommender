from rest_framework import serializers
from .models import Book, Book_rating, Book_view, User_data, User_Book_prediction, Book_similarities

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_data
        fields = (
            'user_id',
            'username',
            'password'
        )

class createUserSerializer(serializers.ModelSerializer):
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
            'user_id',
            'ISBN'
        )

class bookUserPredictionSerializer(serializers.ModelSerializer):
    book = bookSerializer(many=False, read_only=True)
    
    class Meta:
        model = User_Book_prediction
        fields = [
            'ISBN',
            'user_id',
            'prediction',
            'book'
        ]

class bookSimilaritiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book_similarities
        fields = (
            'ISBN',
            'ISBN_similar'
        )
