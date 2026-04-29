from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import hashlib

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_setup_complete = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def set_otp(self, otp):
        self.otp_hash = hashlib.sha256(otp.encode()).hexdigest()

    def verify_otp(self, otp):
        return self.otp_hash == hashlib.sha256(otp.encode()).hexdigest()

    def __str__(self):
        return self.email