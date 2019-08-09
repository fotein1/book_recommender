from django.contrib import admin

from django.contrib import admin
from .models import Book, Book_rating, Book_view, User_data, User_Book_prediction, Book_similarities

admin.register(Book, Book_rating, Book_view, User_data, User_Book_prediction, Book_similarities)(admin.ModelAdmin)

class bookAdmin(admin.ModelAdmin):
  list_display = ['ISBN', 'title', 'author', 'year_of_publication', 'publisher', 'image_url_s', 'image_url_s', 'image_url_l']
