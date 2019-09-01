from celery import shared_task
from .recommendationLib import getUserBookViews, adjustPredictionsByUserFeedback, getUserPredictions
from django.core.cache import cache

@shared_task
def find_recommended_items(user_id, recommendations):
    recommendation_expire_cache_name = 'recommendation_expire_' + user_id
    reocmmendations_user_cache_name  = 'recommendations_' + user_id

    recommendations = getUserPredictions(user_id, recommendations)
    book_views = getUserBookViews(user_id)
    adjustPredictionsByUserFeedback(recommendations, book_views, user_id)
    recommendations = getUserPredictions(user_id, recommendations)

    cache.set(recommendation_expire_cache_name, True, timeout=3600)
    cache.set(reocmmendations_user_cache_name, recommendations, timeout=3600*24)