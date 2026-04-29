import re
from django.contrib.auth import get_user_model
from rest_framework import serializers
from users.utils import generate_otp, send_otp_email
from users.models import EmailOTP
from django.db import transaction
from restaurant.models import UserSubscription

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True, source='confirm_password')
    firstName = serializers.CharField(source='first_name', required=True, min_length=2)
    lastName = serializers.CharField(source='last_name', required=True, min_length=2)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'firstName', 'lastName', 'confirmPassword')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'validators': []}, 
            'email': {'validators': []}
        }

    # 🔴 ONLY format validation here (NO DB checks)
    def validate_username(self, value):
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Username must be between 4 and 20 characters.")
        if not re.match(r"^[a-zA-Z0-9_]+$", value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        return value

    def validate_firstName(self, value):
        if not re.match(r"^[a-zA-Z\s\-]+$", value):
            raise serializers.ValidationError("First name can only contain letters.")
        return value

    def validate_lastName(self, value):
        if not re.match(r"^[a-zA-Z\s\-]+$", value):
            raise serializers.ValidationError("Last name can only contain letters.")
        return value

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({"confirmPassword": "Passwords do not match."})

        if len(password) < 8:
            raise serializers.ValidationError({"password": "Minimum 8 characters required."})

        if not re.search(r"[a-zA-Z]", password) or not re.search(r"[0-9]", password):
            raise serializers.ValidationError({"password": "Must contain letters and numbers."})

        return data

    # ✅ MAIN LOGIC HERE
    def create(self, validated_data):
        validated_data.pop('confirm_password')

        email = validated_data.get('email')
        username = validated_data.get('username')

        with transaction.atomic():

            # 🔍 Find exact match
            existing_user = User.objects.filter(email=email, username=username).first()

            # 🔍 Check conflicts
            email_exists = User.objects.filter(email=email).exclude(username=username).exists()
            username_exists = User.objects.filter(username=username).exclude(email=email).exists()

            # ❌ BLOCK if mismatch exists
            if email_exists or username_exists:
                raise serializers.ValidationError({
                    "error": "Email or username already used with different credentials."
                })

            # ✅ Case 1: SAME user + NOT active → reuse
            if existing_user and not existing_user.is_active:
                user = existing_user

                user.first_name = validated_data.get('first_name')
                user.last_name = validated_data.get('last_name')
                user.set_password(validated_data.get('password'))
                user.save()

            # ❌ Case 2: SAME user but active → block
            elif existing_user and existing_user.is_active:
                raise serializers.ValidationError({
                    "error": "User already verified. Please login."
                })

            # ✅ Case 3: new user
            else:
                validated_data['is_active'] = False
                user = User.objects.create_user(**validated_data)

            # 🔐 OTP
            otp = generate_otp()
            otp_obj, _ = EmailOTP.objects.update_or_create(email=user.email)
            otp_obj.set_otp(otp)
            otp_obj.save()

            send_otp_email(user.email, otp)

            # subscription
            if not UserSubscription.objects.filter(user=user).first():
                UserSubscription.objects.create(user=user)

        return user