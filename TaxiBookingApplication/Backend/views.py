from django.http import JsonResponse
from rest_framework.decorators import api_view
from . import db

# =====================================================================
# CUSTOMER MANAGEMENT APIs
# =====================================================================

@api_view(['POST'])
def customer_add(request):
    data = request.data
    required_fields = ['customer_id', 'full_name', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return JsonResponse({'error': f"Field '{field}' is required"}, status=400)
            
    success, message = db.add_customer(data)
    if success:
        return JsonResponse({'message': message}, status=201)
    else:
        return JsonResponse({'error': message}, status=400)

@api_view(['GET'])
def customer_list(request):
    customers = db.get_customers()
    return JsonResponse(customers, safe=False, status=200)

@api_view(['PUT'])
def customer_update(request, id):
    data = request.data
    success, message = db.update_customer(id, data)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)

@api_view(['DELETE'])
def customer_delete(request, id):
    success, message = db.delete_customer(id)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)


# =====================================================================
# DRIVER MANAGEMENT APIs
# =====================================================================

@api_view(['POST'])
def driver_add(request):
    data = request.data
    required_fields = ['driver_id', 'driver_name', 'email', 'license_number']
    for field in required_fields:
        if field not in data:
            return JsonResponse({'error': f"Field '{field}' is required"}, status=400)
            
    success, message = db.add_driver(data)
    if success:
        return JsonResponse({'message': message}, status=201)
    else:
        return JsonResponse({'error': message}, status=400)

@api_view(['GET'])
def driver_list(request):
    drivers = db.get_drivers()
    return JsonResponse(drivers, safe=False, status=200)

@api_view(['PUT'])
def driver_update(request, id):
    data = request.data
    success, message = db.update_driver(id, data)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)

@api_view(['DELETE'])
def driver_delete(request, id):
    success, message = db.delete_driver(id)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)


# =====================================================================
# VEHICLE MANAGEMENT APIs
# =====================================================================

@api_view(['POST'])
def vehicle_add(request):
    data = request.data
    required_fields = ['vehicle_id', 'driver_name', 'vehicle_type', 'vehicle_number', 'seating_capacity', 'model']
    for field in required_fields:
        if field not in data:
            return JsonResponse({'error': f"Field '{field}' is required"}, status=400)
            
    success, message = db.add_vehicle(data)
    if success:
        return JsonResponse({'message': message}, status=201)
    else:
        return JsonResponse({'error': message}, status=400)

@api_view(['GET'])
def vehicle_list(request):
    vehicles = db.get_vehicles()
    return JsonResponse(vehicles, safe=False, status=200)

@api_view(['PUT'])
def vehicle_update(request, id):
    data = request.data
    success, message = db.update_vehicle(id, data)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)

@api_view(['DELETE'])
def vehicle_delete(request, id):
    success, message = db.delete_vehicle(id)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)


# =====================================================================
# RIDE BOOKING MANAGEMENT APIs
# =====================================================================

@api_view(['POST'])
def booking_add(request):
    data = request.data
    required_fields = ['booking_id', 'customer_name', 'pickup_location', 'drop_location', 'booking_date', 'fare']
    for field in required_fields:
        if field not in data:
            return JsonResponse({'error': f"Field '{field}' is required"}, status=400)
            
    success, message = db.add_booking(data)
    if success:
        return JsonResponse({'message': message}, status=201)
    else:
        return JsonResponse({'error': message}, status=400)

@api_view(['GET'])
def booking_list(request):
    bookings = db.get_bookings()
    return JsonResponse(bookings, safe=False, status=200)

@api_view(['PUT'])
def booking_update(request, id):
    data = request.data
    success, message = db.update_booking(id, data)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)

@api_view(['DELETE'])
def booking_delete(request, id):
    success, message = db.delete_booking(id)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)


# =====================================================================
# PAYMENT MANAGEMENT APIs
# =====================================================================

@api_view(['POST'])
def payment_add(request):
    data = request.data
    required_fields = ['payment_id', 'booking_id', 'customer_name', 'amount', 'payment_method', 'payment_date']
    for field in required_fields:
        if field not in data:
            return JsonResponse({'error': f"Field '{field}' is required"}, status=400)
            
    success, message = db.add_payment(data)
    if success:
        return JsonResponse({'message': message}, status=201)
    else:
        return JsonResponse({'error': message}, status=400)

@api_view(['GET'])
def payment_list(request):
    payments = db.get_payments()
    return JsonResponse(payments, safe=False, status=200)

@api_view(['PUT'])
def payment_update(request, id):
    data = request.data
    success, message = db.update_payment(id, data)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)

@api_view(['DELETE'])
def payment_delete(request, id):
    success, message = db.delete_payment(id)
    if success:
        return JsonResponse({'message': message}, status=200)
    else:
        return JsonResponse({'error': message}, status=404)
