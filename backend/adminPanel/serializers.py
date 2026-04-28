from rest_framework import serializers
from restaurant.models import Transaction, Restaurant, Category, SubscriptionPlan, MenuItem

class TransactionSerializer(serializers.ModelSerializer):
    restaurant = serializers.CharField(source="user.username")
    plan = serializers.CharField(source="plan.name", default=None)

    class Meta:
        model = Transaction
        fields = [
            "restaurant",
            "plan",
            "amount",
            "status",
            "created_at"
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["date"] = instance.created_at.strftime("%b %d")
        data["color"] = "#f97316"
        return data

class TopRestaurantSerializer(serializers.ModelSerializer):
    items = serializers.IntegerField(source="item_count")

    class Meta:
        model = Restaurant
        fields = ["name", "items"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["sub"] = "active"
        data["color"] = "#8b5cf6"
        return data

class CategorySerializer(serializers.ModelSerializer):
    count = serializers.IntegerField()

    class Meta:
        model = Category
        fields = ["name", "count"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["color"] = "#f97316"
        return data

class PlanSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField()

    class Meta:
        model = SubscriptionPlan
        fields = ["name", "count"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["color"] = "#f97316"
        return data

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "is_veg",
            "is_available",
            "image",
        ]


# 🔹 CATEGORY
class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "items",
        ]


# 🔹 RESTAURANT
class RestaurantSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username")
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "slug",
            "owner",
            "phone",
            "email",
            "address",
            "is_active",
            "qr_code",
            "categories",
        ]

class AdminTransactionSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username")
    plan = serializers.CharField(source="plan.name", default=None)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "user",
            "plan",
            "amount",
            "status",
            "created_at",
        ]
    
from rest_framework import serializers
from restaurant.models import SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "name",
            "price",
            "duration_days",
            "features",
            "is_active",
            "created_at",
        ]