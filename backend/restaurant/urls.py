from django.urls import path
from restaurant.views import (
    RestaurantSetupView,
    RestaurantDashboardView,
    RestaurantInfoUpdateView,
    CategoryCRUDView,
    MenuItemCRUDView,
    ToggleMenuItemView,
    PublicMenuView,
    SubscriptionPlanListView,
    CreateRazorpayOrderView,
    VerifyRazorpayPaymentView,
)

urlpatterns = [
    path('setup/',                          RestaurantSetupView.as_view(),       name='restaurant_setup'),
    path('dashboard/',                      RestaurantDashboardView.as_view(),   name='restaurant_dashboard'),
    path('info/',                           RestaurantInfoUpdateView.as_view(),  name='restaurant_info'),
    path('categories/',                     CategoryCRUDView.as_view(),          name='categories'),
    path('categories/<int:cat_id>/',        CategoryCRUDView.as_view(),          name='category_detail'),
    path('items/',                          MenuItemCRUDView.as_view(),          name='menu_items'),
    path('items/<int:item_id>/',            MenuItemCRUDView.as_view(),          name='menu_item_detail'),
    path('items/<int:item_id>/toggle/',     ToggleMenuItemView.as_view(),        name='toggle_menu_item'),
    path('m/<slug:slug>/',                  PublicMenuView.as_view(),            name='public_menu_api'),
    
    # Subscription & Payments
    path('subscription/plans/',             SubscriptionPlanListView.as_view(),  name='subscription_plans'),
    path('payments/create-order/',          CreateRazorpayOrderView.as_view(),   name='create_razorpay_order'),
    path('payments/verify/',                VerifyRazorpayPaymentView.as_view(), name='verify_razorpay_payment'),
]
