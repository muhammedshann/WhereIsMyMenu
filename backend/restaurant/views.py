import json
import razorpay
import uuid
from django.conf import settings
from django.utils.text import slugify
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from restaurant.models import (
    Restaurant, Category, MenuItem, 
    SubscriptionPlan, UserSubscription, Transaction
)


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _is_setup_complete(restaurant):
    # Check essential restaurant fields
    required_fields = [
        restaurant.name, restaurant.tagline, restaurant.description,
        restaurant.phone, restaurant.email, restaurant.address,
        restaurant.maps_link, restaurant.opening_time, restaurant.closing_time,
        restaurant.instagram, restaurant.facebook
    ]
    if not all(required_fields):
        return False
    
    if not restaurant.cover_image or not restaurant.cover_image.name:
        return False

    items = MenuItem.objects.filter(category__restaurant=restaurant)
    if not items.exists():
        return False

    # Every item MUST have an image
    if items.filter(Q(image='') | Q(image__isnull=True)).exists():
        return False

    return True


def _serialize_item(item, request=None):
    return {
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'cat': item.category.name,
        'catId': item.category.id,
        'price': f'₹{float(item.price):.0f}',
        'rawPrice': str(item.price),
        'veg': item.is_veg,
        'status': item.is_available,
        'imageUrl': item.image.url if item.image and item.image.name else None,
    }


# ─── Setup (full multi-step form) ─────────────────────────────────────────────
class RestaurantSetupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            restaurant = request.user.restaurant
        except Restaurant.DoesNotExist:
            return Response({'exists': False})

        categories_data = []
        for cat in restaurant.categories.prefetch_related('items').all():
            items_data = []
            for item in cat.items.all():
                items_data.append({
                    'id': item.id,
                    'name': item.name,
                    'price': str(item.price),
                    'description': item.description,
                    'isVeg': item.is_veg,
                    'imageUrl': item.image.url if item.image else None,
                })
            categories_data.append({'id': cat.id, 'name': cat.name, 'items': items_data})

        return Response({
            'exists': True,
            'restaurantName': restaurant.name,
            'tagline': restaurant.tagline,
            'description': restaurant.description,
            'phone': restaurant.phone,
            'email': restaurant.email or '',
            'address': restaurant.address,
            'mapsLink': restaurant.maps_link or '',
            'openingTime': str(restaurant.opening_time)[:5] if restaurant.opening_time else '',
            'closingTime': str(restaurant.closing_time)[:5] if restaurant.closing_time else '',
            'instagram': restaurant.instagram or '',
            'facebook': restaurant.facebook or '',
            'coverImageUrl': restaurant.cover_image.url if restaurant.cover_image else None,
            'QrCodeImageUrl': restaurant.qr_code.url if restaurant.qr_code else None,
            'categories': categories_data,
        })

    def post(self, request):
        try:
            raw_data = request.data.get('data')
            data = json.loads(raw_data) if raw_data else {}
        except Exception:
            data = {}

        cover_image = request.FILES.get('cover_image')
        categories_data = data.get('categories', [])

        for cat in categories_data:
            for item in cat.get('items', []):
                file_key = f"item_image_{item.get('id')}"
                if file_key in request.FILES:
                    item['_new_image'] = request.FILES[file_key]

        try:
            restaurant = request.user.restaurant
            self._update_restaurant(restaurant, data, cover_image, categories_data)
            return Response({'detail': 'Updated successfully.'})
        except Restaurant.DoesNotExist:
            self._create_restaurant(data, cover_image, categories_data, request.user)
            return Response({'detail': 'Created successfully.'}, status=status.HTTP_201_CREATED)

    def _create_restaurant(self, data, cover_image, categories_data, owner):
        base_slug = slugify(data.get('restaurantName', ''))
        slug = base_slug or f"restaurant-{uuid.uuid4().hex[:6]}"
        if Restaurant.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        restaurant = Restaurant.objects.create(
            owner=owner, name=data.get('restaurantName', ''), slug=slug,
            tagline=data.get('tagline', ''), description=data.get('description', ''),
            phone=data.get('phone', ''), email=data.get('email') or None,
            address=data.get('address', ''), maps_link=data.get('mapsLink', '') or '',
            opening_time=data.get('openingTime') or None, closing_time=data.get('closingTime') or None,
            instagram=data.get('instagram', '') or '', facebook=data.get('facebook', '') or '',
        )
        if cover_image:
            restaurant.cover_image = cover_image
            restaurant.save(update_fields=['cover_image'])

        for cat_data in categories_data:
            category = Category.objects.create(restaurant=restaurant, name=cat_data.get('name', ''))
            for item_data in cat_data.get('items', []):
                item = MenuItem.objects.create(
                    category=category, name=item_data.get('name', ''),
                    description=item_data.get('description', ''),
                    price=item_data.get('price', 0), is_veg=item_data.get('isVeg', True),
                )
                if item_data.get('_new_image'):
                    item.image = item_data['_new_image']
                    item.save(update_fields=['image'])
        return restaurant

    def _update_restaurant(self, restaurant, data, cover_image, categories_data):
        restaurant.name = data.get('restaurantName', restaurant.name)
        restaurant.tagline = data.get('tagline', restaurant.tagline)
        restaurant.description = data.get('description', restaurant.description)
        restaurant.phone = data.get('phone', restaurant.phone)
        restaurant.email = data.get('email') or None
        restaurant.address = data.get('address', restaurant.address)
        restaurant.maps_link = data.get('mapsLink', '') or ''
        restaurant.opening_time = data.get('openingTime') or None
        restaurant.closing_time = data.get('closingTime') or None
        restaurant.instagram = data.get('instagram', '') or ''
        restaurant.facebook = data.get('facebook', '') or ''
        if cover_image:
            restaurant.cover_image = cover_image
        restaurant.save()

        submitted_cat_ids = set()
        for cat_data in categories_data:
            cat_id = cat_data.get('id')
            try:
                category = Category.objects.get(id=int(cat_id), restaurant=restaurant)
                category.name = cat_data.get('name', '')
                category.save()
            except (ValueError, TypeError, Category.DoesNotExist):
                category = Category.objects.create(restaurant=restaurant, name=cat_data.get('name', ''))
            submitted_cat_ids.add(category.id)

            submitted_item_ids = set()
            for item_data in cat_data.get('items', []):
                item_id = item_data.get('id')
                try:
                    item = MenuItem.objects.get(id=int(item_id), category=category)
                    item.name = item_data.get('name', item.name)
                    item.description = item_data.get('description', item.description)
                    item.price = item_data.get('price', item.price)
                    item.is_veg = item_data.get('isVeg', item.is_veg)
                    if item_data.get('_new_image'):
                        item.image = item_data['_new_image']
                    item.save()
                    submitted_item_ids.add(item.id)
                except (ValueError, TypeError, MenuItem.DoesNotExist):
                    new_item = MenuItem.objects.create(
                        category=category, name=item_data.get('name', ''),
                        description=item_data.get('description', ''),
                        price=item_data.get('price', 0), is_veg=item_data.get('isVeg', True),
                    )
                    if item_data.get('_new_image'):
                        new_item.image = item_data['_new_image']
                        new_item.save(update_fields=['image'])
                    submitted_item_ids.add(new_item.id)
            category.items.exclude(id__in=submitted_item_ids).delete()
        restaurant.categories.exclude(id__in=submitted_cat_ids).delete()


# ─── Quick Info Update (from dashboard modal) ─────────────────────────────────
class RestaurantInfoUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            restaurant = request.user.restaurant
        except Restaurant.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        field_map = {
            'name': 'name', 'tagline': 'tagline', 'description': 'description',
            'phone': 'phone', 'address': 'address', 'mapsLink': 'maps_link',
            'instagram': 'instagram', 'facebook': 'facebook',
            'openingTime': 'opening_time', 'closingTime': 'closing_time',
        }
        for key, attr in field_map.items():
            if key in request.data:
                val = request.data[key]
                setattr(restaurant, attr, val or None if attr in ('opening_time', 'closing_time') else val)

        if 'email' in request.data:
            restaurant.email = request.data['email'] or None
        if 'cover_image' in request.FILES:
            restaurant.cover_image = request.FILES['cover_image']
        

        restaurant.save()
        return Response({
            'id': restaurant.id,
            'name': restaurant.name,
            'tagline': restaurant.tagline,
            'phone': restaurant.phone,
            'email': restaurant.email or '',
            'address': restaurant.address,
            'mapsLink': restaurant.maps_link or '',
            'instagram': restaurant.instagram or '',
            'facebook': restaurant.facebook or '',
            'openingTime': str(restaurant.opening_time)[:5] if restaurant.opening_time else '',
            'closingTime': str(restaurant.closing_time)[:5] if restaurant.closing_time else '',
            'setupComplete': _is_setup_complete(restaurant),
        })


# ─── Category CRUD ─────────────────────────────────────────────────────────────
class CategoryCRUDView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            restaurant = request.user.restaurant
        except Restaurant.DoesNotExist:
            return Response({'detail': 'No restaurant.'}, status=404)

        name = request.data.get('name', '').strip()
        if not name:
            return Response({'name': ['This field is required.']}, status=400)

        category = Category.objects.create(restaurant=restaurant, name=name)
        return Response({'id': category.id, 'name': category.name, 'count': 0, 'setupComplete': _is_setup_complete(restaurant)}, status=201)

    def patch(self, request, cat_id):
        try:
            category = Category.objects.get(id=cat_id, restaurant__owner=request.user)
        except Category.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        name = request.data.get('name', '').strip()
        if name:
            category.name = name
            category.save()
        restaurant = category.restaurant
        return Response({'id': category.id, 'name': category.name, 'count': category.items.count(), 'setupComplete': _is_setup_complete(restaurant)})

    def delete(self, request, cat_id):
        try:
            category = Category.objects.get(id=cat_id, restaurant__owner=request.user)
        except Category.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
        restaurant = category.restaurant
        category.delete()
        return Response({'setupComplete': _is_setup_complete(restaurant)}, status=status.HTTP_200_OK)


# ─── Menu Item CRUD ────────────────────────────────────────────────────────────
class MenuItemCRUDView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            restaurant = request.user.restaurant
        except Restaurant.DoesNotExist:
            return Response({'detail': 'No restaurant.'}, status=404)

        errors = {}
        name  = request.data.get('name', '').strip()
        price = request.data.get('price', '')
        cat_id = request.data.get('categoryId')

        if not name:  errors['name']  = ['Required.']
        if not price: errors['price'] = ['Required.']
        if not cat_id: errors['categoryId'] = ['Required.']
        if errors:
            return Response(errors, status=400)

        try:
            category = Category.objects.get(id=cat_id, restaurant=restaurant)
        except Category.DoesNotExist:
            return Response({'categoryId': ['Invalid category.']}, status=400)

        item = MenuItem.objects.create(
            category=category, name=name,
            description=request.data.get('description', ''),
            price=price,
            is_veg=str(request.data.get('isVeg', 'true')).lower() != 'false',
        )
        if 'image' in request.FILES:
            item.image = request.FILES['image']
            item.save(update_fields=['image'])

        return Response({**_serialize_item(item, request), 'setupComplete': _is_setup_complete(restaurant)}, status=201)

    def patch(self, request, item_id):
        try:
            item = MenuItem.objects.get(id=item_id, category__restaurant__owner=request.user)
        except MenuItem.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        if 'name'        in request.data: item.name        = request.data['name']
        if 'description' in request.data: item.description = request.data['description']
        if 'price'       in request.data: item.price       = request.data['price']
        if 'isVeg'       in request.data: item.is_veg      = str(request.data['isVeg']).lower() != 'false'
        if 'categoryId'  in request.data:
            try:
                item.category = Category.objects.get(id=request.data['categoryId'], restaurant__owner=request.user)
            except Category.DoesNotExist:
                pass
        if 'image' in request.FILES:
            item.image = request.FILES['image']
        item.save()
        restaurant = item.category.restaurant
        return Response({**_serialize_item(item, request), 'setupComplete': _is_setup_complete(restaurant)})

    def delete(self, request, item_id):
        try:
            item = MenuItem.objects.get(id=item_id, category__restaurant__owner=request.user)
        except MenuItem.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)
        restaurant = item.category.restaurant
        item.delete()
        return Response({'setupComplete': _is_setup_complete(restaurant)}, status=status.HTTP_200_OK)


# ─── Dashboard ─────────────────────────────────────────────────────────────────
class RestaurantDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            restaurant = request.user.restaurant
        except Restaurant.DoesNotExist:
            return Response({'detail': 'No restaurant found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check subscription status
        try:
            subscription = request.user.subscription
            is_active = subscription.is_valid()
        except UserSubscription.DoesNotExist:
            is_active = False

        if not is_active:
            # Return limited data if subscription is not active
            return Response({
                'restaurant': {
                    'name': restaurant.name,
                    'slug': restaurant.slug,
                    'isSubscribed': False,
                    'setupComplete': _is_setup_complete(restaurant),
                },
                'subscription': {
                    'status': getattr(subscription, 'status', 'no_subscription') if 'subscription' in locals() else 'no_subscription',
                },
                'stats': {'totalCategories': 0, 'totalItems': 0, 'availableItems': 0, 'unavailableItems': 0},
                'categories': [],
                'items': [],
                'setupSteps': [],
            })

        categories = Category.objects.filter(restaurant=restaurant).prefetch_related('items')
        categories_data = [{'id': c.id, 'name': c.name, 'count': c.items.count()} for c in categories]

        all_items = MenuItem.objects.filter(category__restaurant=restaurant).select_related('category')
        items_data = [_serialize_item(i, request) for i in all_items]

        total_items     = all_items.count()
        available       = all_items.filter(is_available=True).count()

        setup_steps = [
            {'key': 'basicInfo',   'label': 'Restaurant Name & Info', 'done': bool(restaurant.name and restaurant.address)},
            {'key': 'contactInfo', 'label': 'Contact & Location',     'done': bool(restaurant.phone)},
            {'key': 'menuAdded',   'label': 'Menu with Items',        'done': total_items > 0},
            {'key': 'imagesAdded', 'label': 'Cover & Item Images',    'done': bool(restaurant.cover_image and restaurant.cover_image.name)},
        ]

        return Response({
            'restaurant': {
                'id': restaurant.id, 'name': restaurant.name, 'tagline': restaurant.tagline,
                'slug': restaurant.slug, 'menuUrl': f"{settings.FRONTEND_URL}{restaurant.slug}",
                'setupComplete': _is_setup_complete(restaurant),
                'isSubscribed': True,
                'subscription': {
                    'planName': subscription.plan.name if subscription.plan else 'Pro',
                    'status': subscription.status,
                    'expiryDate': subscription.end_date.strftime('%d %b, %Y') if subscription.end_date else 'N/A'
                },
                'phone': restaurant.phone, 'email': restaurant.email or '',
                'address': restaurant.address, 'mapsLink': restaurant.maps_link or '',
                'instagram': restaurant.instagram or '', 'facebook': restaurant.facebook or '',
                'openingTime': str(restaurant.opening_time)[:5] if restaurant.opening_time else '',
                'closingTime': str(restaurant.closing_time)[:5] if restaurant.closing_time else '',
                'coverImageUrl': restaurant.cover_image.url if restaurant.cover_image else None,
                'QrCodeImageUrl': restaurant.qr_code.url if restaurant.qr_code else None,
            },
            'setupSteps': setup_steps,
            'stats': {
                'totalCategories': categories.count(), 'totalItems': total_items,
                'availableItems': available, 'unavailableItems': total_items - available,
            },
            'categories': categories_data,
            'items': items_data,
        })


# ─── Toggle Item ───────────────────────────────────────────────────────────────
class ToggleMenuItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            item = MenuItem.objects.get(id=item_id, category__restaurant__owner=request.user)
        except MenuItem.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        item.is_available = not item.is_available
        item.save()
        return Response({
            'id': item.id,
            'isAvailable': item.is_available,
            'setupComplete': _is_setup_complete(item.category.restaurant)
        })

# ─── Public Menu View ──────────────────────────────────────────────────────────
class PublicMenuView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            restaurant = Restaurant.objects.get(slug=slug)
        except Restaurant.DoesNotExist:
            return Response({'detail': 'Restaurant not found.'}, status=status.HTTP_404_NOT_FOUND)

        categories = Category.objects.filter(restaurant=restaurant).prefetch_related('items')
        categories_data = []
        for cat in categories:
            items_data = [_serialize_item(i, request) for i in cat.items.filter(is_available=True)]
            if items_data: # Only show categories with available items
                categories_data.append({
                    'id': cat.id,
                    'name': cat.name,
                    'items': items_data
                })

        return Response({
            'restaurant': {
                'name': restaurant.name,
                'tagline': restaurant.tagline,
                'description': restaurant.description,
                'phone': restaurant.phone,
                'email': restaurant.email or '',
                'address': restaurant.address,
                'mapsLink': restaurant.maps_link or '',
                'openingTime': str(restaurant.opening_time)[:5] if restaurant.opening_time else '',
                'closingTime': str(restaurant.closing_time)[:5] if restaurant.closing_time else '',
                'instagram': restaurant.instagram or '',
                'facebook': restaurant.facebook or '',
                'coverImage': restaurant.cover_image.url if restaurant.cover_image and restaurant.cover_image.name else None,
                'isSubscribed': restaurant.owner.subscription.is_valid() if hasattr(restaurant.owner, 'subscription') else False
            },
            'categories': categories_data if (hasattr(restaurant.owner, 'subscription') and restaurant.owner.subscription.is_valid()) else [],
        })

# ─── Subscription & Payments ───────────────────────────────────────────────────

class SubscriptionPlanListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True)
        data = [{
            'id': p.id,
            'name': p.name,
            'price': str(p.price),
            'duration_days': p.duration_days,
            'features': p.features
        } for p in plans]
        return Response(data)

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('planId')
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Invalid plan.'}, status=400)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        
        # Razorpay amount is in paise (1 INR = 100 paise)
        amount = int(plan.price * 100)
        
        try:
            order = client.order.create({
                "amount": amount,
                "currency": "INR",
                "payment_capture": "1"
            })
            
            # Save pending transaction
            Transaction.objects.create(
                user=request.user,
                plan=plan,
                amount=plan.price,
                razorpay_order_id=order['id'],
                status='pending'
            )
            
            return Response({
                'orderId': order['id'],
                'amount': amount,
                'currency': "INR",
                'keyId': settings.RAZORPAY_KEY_ID,
                'planName': plan.name
            })
        except Exception as e:
            return Response({'detail': str(e)}, status=500)

class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }

        try:
            # Re-creating the signature verify
            client.utility.verify_payment_signature(params_dict)
            
            # Update transaction
            try:
                transaction = Transaction.objects.get(razorpay_order_id=order_id)
                transaction.status = 'success'
                transaction.razorpay_payment_id = payment_id
                transaction.razorpay_signature = signature
                transaction.save()
                
                # Activate User Subscription
                subscription, created = UserSubscription.objects.get_or_create(user=request.user)
                subscription.activate(transaction.plan)
                
                return Response({'detail': 'Payment successful and subscription activated.'})
            except Transaction.DoesNotExist:
                return Response({'detail': 'Transaction not found.'}, status=404)
                
        except Exception:
            # Payment verification failed
            if order_id:
                Transaction.objects.filter(razorpay_order_id=order_id).update(status='failed')
            return Response({'detail': 'Payment verification failed.'}, status=400)

