from .views import bookAPIView, userBookRecommendationsAPIView, bookRudView
from django.conf.urls import url, include

book_urls = [
  url(r'^$', bookAPIView.as_view(), name='books'),
  url(r'^/(?P<ISBN>\d+)$', bookRudView.as_view(), name='book-details'),
]

user_book_recommendations_urls = [
  url(r'^/users/(?P<pk>\d+)$', userBookRecommendationsAPIView.as_view(), name='user-book-recommendations'),
]

urlpatterns = [
    url(r'^books', include(book_urls)),
    url(r'^books-recommendations', include(user_book_recommendations_urls)),
]