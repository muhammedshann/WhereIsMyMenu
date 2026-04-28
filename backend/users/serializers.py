from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Map camelCase from frontend to snake_case in backend
    confirmPassword = serializers.CharField(write_only=True, source='confirm_password')
    firstName = serializers.CharField(source='first_name', required=False, allow_blank=True)
    lastName = serializers.CharField(source='last_name', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'firstName', 'lastName', 'confirmPassword')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirmPassword": "Passwords match failed"})
        return data

    def create(self, validated_data):
        from restaurant.models import UserSubscription
        
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        
        # Automatically create an inactive subscription for the new user
        UserSubscription.objects.create(user=user)
        
        return user
