from django.urls import path
from . import views

urlpatterns = [
    # Customers APIs (4)
    path('customers/add/', views.customer_add, name='customer_add'),
    path('customers/', views.customer_list, name='customer_list'),
    path('customers/update/<int:id>/', views.customer_update, name='customer_update'),
    path('customers/delete/<int:id>/', views.customer_delete, name='customer_delete'),
    
    # Drivers APIs (4)
    path('drivers/add/', views.driver_add, name='driver_add'),
    path('drivers/', views.driver_list, name='driver_list'),
    path('drivers/update/<int:id>/', views.driver_update, name='driver_update'),
    path('drivers/delete/<int:id>/', views.driver_delete, name='driver_delete'),

    # Vehicles APIs (4)
    path('vehicles/add/', views.vehicle_add, name='vehicle_add'),
    path('vehicles/', views.vehicle_list, name='vehicle_list'),
    path('vehicles/update/<int:id>/', views.vehicle_update, name='vehicle_update'),
    path('vehicles/delete/<int:id>/', views.vehicle_delete, name='vehicle_delete'),

    # Ride Bookings APIs (4)
    path('bookings/add/', views.booking_add, name='booking_add'),
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/update/<int:id>/', views.booking_update, name='booking_update'),
    path('bookings/delete/<int:id>/', views.booking_delete, name='booking_delete'),

    # Payments APIs (4)
    path('payments/add/', views.payment_add, name='payment_add'),
    path('payments/', views.payment_list, name='payment_list'),
    path('payments/update/<int:id>/', views.payment_update, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_delete, name='payment_delete'),
]
