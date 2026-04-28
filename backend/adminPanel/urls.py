from django.urls import path
from adminPanel.views import AdminDashboardView, AdminRestaurantsView, AdminTransactionView, AdminSubscriptionPlanView

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('restaurants/', AdminRestaurantsView.as_view()),
    path("transactions/", AdminTransactionView.as_view(), name="admin-transactions"),
    path("plans/", AdminSubscriptionPlanView.as_view()),
    path("plans/<int:pk>/", AdminSubscriptionPlanView.as_view()),

]
