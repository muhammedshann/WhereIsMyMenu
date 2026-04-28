from django.contrib import admin
from users.models import User

models = [User]

for model in models:
    admin.site.register(model)