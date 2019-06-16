from .views import bookAPIView, userBookRecommendationsAPIView, bookRudView, accountAPIView, sessionAPIView
from django.conf.urls import url, include

accounts_urls = [
  url(r'^$', accountAPIView.as_view(), name='accounts')
]

sessions_urls = [
  url(r'^$', sessionAPIView.as_view(), name='sessions')
]

book_urls = [
  url(r'^$', bookAPIView.as_view(), name='books'),
  url(r'^/(?P<ISBN>\w+)$', bookRudView.as_view(), name='book-details'),
]

user_book_recommendations_urls = [
  url(r'^/users/(?P<pk>\d+)$', userBookRecommendationsAPIView.as_view(), name='user-book-recommendations'),
]

urlpatterns = [
  url(r'^accounts', include(accounts_urls)),
  url(r'^sessions', include(sessions_urls)),
  url(r'^books', include(book_urls)),
  url(r'^books-recommendations', include(user_book_recommendations_urls)),
]