from django.contrib import admin
from restaurant.models import Restaurant, Category, MenuItem, SubscriptionPlan, UserSubscription, Transaction

models = [Restaurant, Category, MenuItem, SubscriptionPlan, UserSubscription, Transaction]

for model in models:
    admin.site.register(model)