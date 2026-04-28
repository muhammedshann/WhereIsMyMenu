from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

import qrcode
from io import BytesIO
from django.core.files import File

User = get_user_model()

class Restaurant(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='restaurant')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)

    tagline = models.CharField(max_length=250, blank=True)
    description = models.TextField(blank=True)

    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    address = models.TextField()
    maps_link = models.URLField(max_length=1000, blank=True)

    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)

    instagram = models.URLField(blank=True)
    facebook = models.URLField(blank=True)

    cover_image = models.ImageField(upload_to='restaurant_covers/', null=True, blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        url = f"http://localhost:5173/{self.slug}"

        qr = qrcode.make(url)

        buffer = BytesIO()
        qr.save(buffer, format='PNG')

        file_name = f"{self.slug}_qr.png"
        self.qr_code.save(file_name, File(buffer), save=False)

        super().save(update_fields=['qr_code'])

    def __str__(self):
        return self.name

class Category(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"


class MenuItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    is_veg = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)

    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} - {self.category.name}"


class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    duration_days = models.IntegerField(default=30)

    features = models.JSONField(default=list)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserSubscription(models.Model):
    STATUS_CHOICES = (
        ('inactive', 'Inactive'),
        ('active', 'Active'),
        ('expired', 'Expired'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='subscription'
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')

    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_valid(self):
        return (
            self.status == 'active' and
            self.end_date and
            self.end_date > timezone.now()
        )

    def activate(self, plan):
        self.plan = plan
        self.start_date = timezone.now()
        self.end_date = timezone.now() + timedelta(days=plan.duration_days)
        self.status = 'active'
        self.save()

    def __str__(self):
        return f"{self.user} - {self.status}"

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    razorpay_order_id = models.CharField(max_length=255, unique=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.amount} - {self.status}"