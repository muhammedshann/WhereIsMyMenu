from rest_framework import serializers
from restaurant.models import Restaurant, Category, MenuItem, Transaction
from django.utils.text import slugify
from django.core.validators import MinValueValidator, URLValidator, RegexValidator
from decimal import Decimal
import uuid

class MenuItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=2, max_length=200)
    isVeg = serializers.BooleanField(source='is_veg', required=False, default=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'isVeg', 'is_available', 'image']

class CategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=2, max_length=100)
    items = MenuItemSerializer(many=True, required=False)

    class Meta:
        model = Category
        fields = ['id', 'name', 'items']

class RestaurantSetupSerializer(serializers.ModelSerializer):
    restaurantName = serializers.CharField(source='name', min_length=2, max_length=100)
    phone = serializers.CharField(
        validators=[RegexValidator(regex=r"^\+?[1-9]\d{9,14}$", message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")]
    )
    mapsLink = serializers.URLField(source='maps_link', required=False, allow_blank=True, allow_null=True, validators=[URLValidator()])
    openingTime = serializers.TimeField(source='opening_time', required=False, allow_null=True)
    closingTime = serializers.TimeField(source='closing_time', required=False, allow_null=True)
    
    instagram = serializers.URLField(required=False, allow_blank=True, allow_null=True, validators=[URLValidator()])
    facebook = serializers.URLField(required=False, allow_blank=True, allow_null=True, validators=[URLValidator()])
    
    categories = CategorySerializer(many=True, required=False)
    
    class Meta:
        model = Restaurant
        fields = [
            'id', 'restaurantName', 'tagline', 'description', 
            'phone', 'email', 'address', 'mapsLink', 
            'openingTime', 'closingTime', 'instagram', 'facebook', 
            'categories', 'cover_image'
        ]

    def validate(self, data):
        opening = data.get('opening_time')
        closing = data.get('closing_time')

        if opening and closing:
            if closing <= opening:
                raise serializers.ValidationError({"closingTime": "Closing time must be after opening time."})
                
        return data

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])
        
        # Generate slug
        base_slug = slugify(validated_data.get('name', ''))
        slug = base_slug
        if not slug:
            slug = f"restaurant-{uuid.uuid4().hex[:6]}"
        elif Restaurant.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
            
        validated_data['slug'] = slug
        
        # Owner is passed from the view's serializer save method (save(owner=request.user))
        restaurant = Restaurant.objects.create(**validated_data)
        
        # Process Nested Categories -> Items
        for cat_data in categories_data:
            items_data = cat_data.pop('items', [])
            category = Category.objects.create(restaurant=restaurant, **cat_data)
            
            for item_data in items_data:
                MenuItem.objects.create(category=category, **item_data)
                
        return restaurant

