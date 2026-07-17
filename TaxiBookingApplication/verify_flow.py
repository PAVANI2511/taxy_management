import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def send_request(url, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(f"{BASE_URL}{url}", data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body) if body else {}
    except Exception as e:
        return 500, {"error": str(e)}

def test_full_workflow():
    print("Starting full transaction workflow test...")
    
    # 1. Register a new customer
    cust_id = 999
    cust_data = {
        "customer_id": cust_id,
        "full_name": "Test Workflow Customer",
        "email": "workflow_cust@gmail.com",
        "phone": "1234567890",
        "address": "Delhi",
        "password": "cust123password"
    }
    code, res = send_request("/customers/add/", "POST", cust_data)
    assert code == 201, f"Failed customer registration: {res}"
    print("1. Customer registered.")

    # 2. Register a new driver
    driver_id = 888
    driver_data = {
        "driver_id": driver_id,
        "driver_name": "Test Workflow Driver",
        "email": "workflow_driver@gmail.com",
        "phone": "0987654321",
        "license_number": "LIC98765",
        "experience": 8,
        "availability": "Available",
        "password": "driver123password"
    }
    code, res = send_request("/drivers/add/", "POST", driver_data)
    assert code == 201, f"Failed driver registration: {res}"
    print("2. Driver registered.")

    # 3. Register a vehicle for the driver
    vehicle_id = 777
    vehicle_data = {
        "vehicle_id": vehicle_id,
        "driver_name": "Test Workflow Driver",
        "vehicle_type": "Sedan",
        "vehicle_number": "DL01AB8888",
        "seating_capacity": 4,
        "model": "Honda Civic"
    }
    code, res = send_request("/vehicles/add/", "POST", vehicle_data)
    assert code == 201, f"Failed vehicle registration: {res}"
    print("3. Vehicle registered.")

    # 4. Customer books a ride
    booking_id = 666
    booking_data = {
        "booking_id": booking_id,
        "customer_name": "Test Workflow Customer",
        "driver_name": "Test Workflow Driver",
        "pickup_location": "Delhi Airport",
        "drop_location": "Connaught Place",
        "booking_date": "2026-07-20",
        "fare": 450.0,
        "ride_status": "Accepted"
    }
    code, res = send_request("/bookings/add/", "POST", booking_data)
    assert code == 201, f"Failed booking creation: {res}"
    print("4. Booking created (Assigned to Test Workflow Driver).")

    # Set driver to Busy
    code, res = send_request(f"/drivers/update/{driver_id}/", "PUT", {"availability": "Busy"})
    assert code == 200, f"Failed driver status update: {res}"
    print("5. Driver status updated to Busy.")

    # 5. Customer pays for booking
    payment_id = 555
    payment_data = {
        "payment_id": payment_id,
        "booking_id": booking_id,
        "customer_name": "Test Workflow Customer",
        "amount": 450.0,
        "payment_method": "UPI",
        "payment_status": "Success",
        "transaction_id": "TXNWORKFLOW123",
        "payment_date": "2026-07-20"
    }
    code, res = send_request("/payments/add/", "POST", payment_data)
    assert code == 201, f"Failed payment creation: {res}"
    print("6. Payment processed successfully (Success).")

    # 6. Driver starts and completes ride
    code, res = send_request(f"/bookings/update/{booking_id}/", "PUT", {"ride_status": "Completed"})
    assert code == 200, f"Failed booking completion: {res}"
    print("7. Ride status updated to Completed.")

    # Set driver back to Available
    code, res = send_request(f"/drivers/update/{driver_id}/", "PUT", {"availability": "Available"})
    assert code == 200, f"Failed driver reset availability: {res}"
    print("8. Driver status reset to Available.")

    # 7. Cleanup test records
    send_request(f"/customers/delete/{cust_id}/", "DELETE")
    send_request(f"/drivers/delete/{driver_id}/", "DELETE")
    send_request(f"/vehicles/delete/{vehicle_id}/", "DELETE")
    send_request(f"/bookings/delete/{booking_id}/", "DELETE")
    send_request(f"/payments/delete/{payment_id}/", "DELETE")
    print("9. Test records cleaned up successfully.")

    print("\nFull Workflow Test Passed!")

if __name__ == '__main__':
    test_full_workflow()
