from rest_framework import serializers
from restaurant.models import Restaurant, Category, MenuItem, Transaction
from django.utils.text import slugify
import uuid

class MenuItemSerializer(serializers.ModelSerializer):
    isVeg = serializers.BooleanField(source='is_veg', required=False, default=True)
    
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'description', 'price', 'isVeg', 'is_available', 'image']

class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, required=False)

    class Meta:
        model = Category
        fields = ['id', 'name', 'items']

class RestaurantSetupSerializer(serializers.ModelSerializer):
    restaurantName = serializers.CharField(source='name')
    mapsLink = serializers.CharField(source='maps_link', required=False, allow_blank=True, allow_null=True)
    openingTime = serializers.TimeField(source='opening_time', required=False, allow_null=True)
    closingTime = serializers.TimeField(source='closing_time', required=False, allow_null=True)
    
    instagram = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    facebook = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    categories = CategorySerializer(many=True, required=False)
    
    class Meta:
        model = Restaurant
        fields = [
            'id', 'restaurantName', 'tagline', 'description', 
            'phone', 'email', 'address', 'mapsLink', 
            'openingTime', 'closingTime', 'instagram', 'facebook', 
            'categories', 'cover_image'
        ]

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

