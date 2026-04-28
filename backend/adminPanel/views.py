from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth import get_user_model
from restaurant.models import Restaurant, Category, MenuItem
from restaurant.models import UserSubscription, Transaction, SubscriptionPlan
from django.db.models import Prefetch
from django.db.models import Q


from adminPanel.serializers import (
    TransactionSerializer,
    TopRestaurantSerializer,
    CategorySerializer,
    PlanSerializer,
    RestaurantSerializer,
    AdminTransactionSerializer,
    SubscriptionPlanSerializer
)

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # 🔒 ADMIN ONLY
        if not request.user.is_staff:
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ─────────────────────────────
        # 🔥 BASIC STATS
        # ─────────────────────────────
        total_users = User.objects.count()
        total_restaurants = Restaurant.objects.count()
        total_items = MenuItem.objects.count()

        active_subs = UserSubscription.objects.filter(
            status="active",
        ).count()

        total_revenue = Transaction.objects.filter(
            status="success"
        ).aggregate(total=Sum("amount"))["total"] or 0


        # ─────────────────────────────
        # 🔥 REVENUE DATA (6 months)
        # ─────────────────────────────
        revenue_data = []

        for i in range(6):
            date = timezone.now() - timedelta(days=30 * i)

            revenue = Transaction.objects.filter(
                created_at__month=date.month,
                status="success"
            ).aggregate(total=Sum("amount"))["total"] or 0

            subs = UserSubscription.objects.filter(
                start_date__month=date.month
            ).count()

            revenue_data.append({
                "month": date.strftime("%b"),
                "revenue": float(revenue),
                "subs": subs * 100
            })

        revenue_data.reverse()


        # ─────────────────────────────
        # 🔥 SIGNUPS
        # ─────────────────────────────
        signup_data = []

        for i in range(6):
            date = timezone.now() - timedelta(days=30 * i)

            signups = Restaurant.objects.filter(
                created_at__month=date.month
            ).count()

            activated = UserSubscription.objects.filter(
                start_date__month=date.month,
                status="active"
            ).count()

            signup_data.append({
                "month": date.strftime("%b"),
                "signups": signups,
                "activated": activated
            })

        signup_data.reverse()


        # ─────────────────────────────
        # 🔥 SUB STATUS
        # ─────────────────────────────
        sub_status_data = [
            {
                "name": "Active",
                "value": UserSubscription.objects.filter(status="active").count(),
                "color": "#4ade80"
            },
            {
                "name": "Expired",
                "value": UserSubscription.objects.filter(status="expired").count(),
                "color": "#f87171"
            },
            {
                "name": "Inactive",
                "value": UserSubscription.objects.filter(status="inactive").count(),
                "color": "#3f3f46"
            },
        ]


        # ─────────────────────────────
        # 🔥 VEG / NON VEG
        # ─────────────────────────────
        veg_data = [
            {
                "name": "Veg",
                "value": MenuItem.objects.filter(is_veg=True).count(),
                "color": "#4ade80"
            },
            {
                "name": "Non-Veg",
                "value": MenuItem.objects.filter(is_veg=False).count(),
                "color": "#f87171"
            },
        ]


        # ─────────────────────────────
        # 🔥 PLAN DATA (SERIALIZER)
        # ─────────────────────────────
        plans_qs = SubscriptionPlan.objects.annotate(
            count=Count("usersubscription")  # ⚠️ adjust if needed
        )

        plan_data = PlanSerializer(plans_qs, many=True).data


        # ─────────────────────────────
        # 🔥 TOP CATEGORIES
        # ─────────────────────────────
        top_categories_qs = Category.objects.annotate(
            count=Count("items")
        ).order_by("-count")[:5]

        top_categories_data = CategorySerializer(top_categories_qs, many=True).data


        # ─────────────────────────────
        # 🔥 TRANSACTIONS
        # ─────────────────────────────
        transactions_qs = Transaction.objects.select_related(
            "user", "plan"
        ).order_by("-created_at")[:10]

        transactions_data = TransactionSerializer(transactions_qs, many=True).data


        # ─────────────────────────────
        # 🔥 TOP RESTAURANTS
        # ─────────────────────────────
        top_restaurants_qs = Restaurant.objects.annotate(
            item_count=Count("categories__items")
        ).order_by("-item_count")[:10]

        top_restaurants_data = TopRestaurantSerializer(
            top_restaurants_qs,
            many=True
        ).data


        # ─────────────────────────────
        # 🔥 SUMMARY
        # ─────────────────────────────
        summary = {
            "totalUsers": total_users,
            "totalRevenue": f"₹{int(total_revenue)}",
            "avgItems": int(total_items / total_restaurants) if total_restaurants else 0,
            "qrScans": 18240,
            "uptime": "99.8%"
        }


        # ─────────────────────────────
        # 🔥 STATS
        # ─────────────────────────────
        stats = {
            "restaurants": total_restaurants,
            "restaurantsSub": "+ this month",
            "activeSubs": active_subs,
            "activeSubsSub": "Active users",
            "mrr": f"₹{int(total_revenue)}",
            "mrrSub": "Monthly revenue",
            "menuItems": total_items,
            "menuItemsSub": "Total items",
        }

        return Response({
            "stats": stats,
            "summary": summary,
            "revenueData": revenue_data,
            "signupData": signup_data,
            "subStatusData": sub_status_data,
            "vegData": veg_data,
            "planData": plan_data,
            "topCategories": top_categories_data,
            "transactions": transactions_data,
            "topRestaurants": top_restaurants_data,
        })

class AdminRestaurantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # 🔒 ADMIN CHECK
        if not request.user.is_staff:
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 🔥 OPTIMIZED QUERY (IMPORTANT)
        restaurants = Restaurant.objects.select_related("owner").prefetch_related(
            Prefetch(
                "categories",
                queryset=Category.objects.prefetch_related("items")
            )
        )

        serializer = RestaurantSerializer(restaurants, many=True)

        return Response(serializer.data)


class AdminTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # 🔒 ADMIN ONLY
        if not request.user.is_staff:
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = Transaction.objects.select_related("user", "plan").order_by("-created_at")

        # 🔍 SEARCH (user or plan)
        search = request.GET.get("search")
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(plan__name__icontains=search)
            )

        # 🔍 STATUS FILTER
        status_filter = request.GET.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # 🔍 DATE FILTER
        start_date = request.GET.get("start")
        end_date = request.GET.get("end")

        if start_date and end_date:
            queryset = queryset.filter(created_at__date__range=[start_date, end_date])

        # 🔥 LIMIT (simple pagination)
        limit = int(request.GET.get("limit", 20))
        queryset = queryset[:limit]

        serializer = AdminTransactionSerializer(queryset, many=True)

        return Response(serializer.data)

class AdminSubscriptionPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=403)

        plans = SubscriptionPlan.objects.all().order_by("-created_at")
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data)


    def post(self, request):
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=403)

        serializer = SubscriptionPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


    def put(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=403)

        plan = SubscriptionPlan.objects.get(id=pk)
        serializer = SubscriptionPlanSerializer(plan, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


    def delete(self, request, pk):
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=403)

        plan = SubscriptionPlan.objects.get(id=pk)
        plan.delete()
        return Response({"message": "Deleted"})