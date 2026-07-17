import urllib.request
import urllib.parse
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
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, json.loads(body) if body else {}
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("Starting API Verification Tests...")
    
    # ----------------------------------------------------
    # Module 1: Customers (4 APIs)
    # ----------------------------------------------------
    print("\n--- Testing Customer APIs ---")
    # GET list
    code, res = send_request("/customers/")
    print(f"GET /customers/: Code {code}, Found {len(res)} customers")
    
    # POST add
    new_cust = {
        "customer_id": 102,
        "full_name": "Test Customer",
        "email": "testcust@gmail.com",
        "phone": "9999999999",
        "address": "Bangalore",
        "password": "testpassword"
    }
    code, res = send_request("/customers/add/", method="POST", data=new_cust)
    print(f"POST /customers/add/: Code {code}, Message: {res}")
    
    # PUT update
    update_cust_data = {"full_name": "Updated Test Customer"}
    code, res = send_request("/customers/update/102/", method="PUT", data=update_cust_data)
    print(f"PUT /customers/update/102/: Code {code}, Message: {res}")
    
    # DELETE delete
    code, res = send_request("/customers/delete/102/", method="DELETE")
    print(f"DELETE /customers/delete/102/: Code {code}, Message: {res}")

    # ----------------------------------------------------
    # Module 2: Drivers (4 APIs)
    # ----------------------------------------------------
    print("\n--- Testing Driver APIs ---")
    # GET list
    code, res = send_request("/drivers/")
    print(f"GET /drivers/: Code {code}, Found {len(res)} drivers")
    
    # POST add
    new_driver = {
        "driver_id": 202,
        "driver_name": "Test Driver",
        "email": "testdriver@gmail.com",
        "phone": "8888888888",
        "license_number": "DL999999",
        "experience": 3,
        "availability": "Available",
        "password": "testpwd"
    }
    code, res = send_request("/drivers/add/", method="POST", data=new_driver)
    print(f"POST /drivers/add/: Code {code}, Message: {res}")
    
    # PUT update
    update_driver_data = {"availability": "Busy"}
    code, res = send_request("/drivers/update/202/", method="PUT", data=update_driver_data)
    print(f"PUT /drivers/update/202/: Code {code}, Message: {res}")
    
    # DELETE delete
    code, res = send_request("/drivers/delete/202/", method="DELETE")
    print(f"DELETE /drivers/delete/202/: Code {code}, Message: {res}")

    # ----------------------------------------------------
    # Module 3: Vehicles (4 APIs)
    # ----------------------------------------------------
    print("\n--- Testing Vehicle APIs ---")
    # GET list
    code, res = send_request("/vehicles/")
    print(f"GET /vehicles/: Code {code}, Found {len(res)} vehicles")
    
    # POST add
    new_vehicle = {
        "vehicle_id": 302,
        "driver_name": "Ramesh Kumar",
        "vehicle_type": "Sedan",
        "vehicle_number": "KA01AB9999",
        "seating_capacity": 4,
        "model": "Honda City"
    }
    code, res = send_request("/vehicles/add/", method="POST", data=new_vehicle)
    print(f"POST /vehicles/add/: Code {code}, Message: {res}")
    
    # PUT update
    update_vehicle_data = {"model": "Honda City CVT"}
    code, res = send_request("/vehicles/update/302/", method="PUT", data=update_vehicle_data)
    print(f"PUT /vehicles/update/302/: Code {code}, Message: {res}")
    
    # DELETE delete
    code, res = send_request("/vehicles/delete/302/", method="DELETE")
    print(f"DELETE /vehicles/delete/302/: Code {code}, Message: {res}")

    # ----------------------------------------------------
    # Module 4: Bookings (4 APIs)
    # ----------------------------------------------------
    print("\n--- Testing Booking APIs ---")
    # GET list
    code, res = send_request("/bookings/")
    print(f"GET /bookings/: Code {code}, Found {len(res)} bookings")
    
    # POST add
    new_booking = {
        "booking_id": 402,
        "customer_name": "Rahul Sharma",
        "driver_name": "Ramesh Kumar",
        "pickup_location": "Airport",
        "drop_location": "Hotel",
        "booking_date": "2026-08-20",
        "fare": 500.0,
        "ride_status": "Requested"
    }
    code, res = send_request("/bookings/add/", method="POST", data=new_booking)
    print(f"POST /bookings/add/: Code {code}, Message: {res}")
    
    # PUT update
    update_booking_data = {"ride_status": "In Progress"}
    code, res = send_request("/bookings/update/402/", method="PUT", data=update_booking_data)
    print(f"PUT /bookings/update/402/: Code {code}, Message: {res}")
    
    # DELETE delete
    code, res = send_request("/bookings/delete/402/", method="DELETE")
    print(f"DELETE /bookings/delete/402/: Code {code}, Message: {res}")

    # ----------------------------------------------------
    # Module 5: Payments (4 APIs)
    # ----------------------------------------------------
    print("\n--- Testing Payment APIs ---")
    # GET list
    code, res = send_request("/payments/")
    print(f"GET /payments/: Code {code}, Found {len(res)} payments")
    
    # POST add
    new_payment = {
        "payment_id": 502,
        "booking_id": 401,
        "customer_name": "Rahul Sharma",
        "amount": 350.0,
        "payment_method": "UPI",
        "payment_status": "Pending",
        "transaction_id": "TXN999999",
        "payment_date": "2026-08-15"
    }
    code, res = send_request("/payments/add/", method="POST", data=new_payment)
    print(f"POST /payments/add/: Code {code}, Message: {res}")
    
    # PUT update
    update_payment_data = {"payment_status": "Success"}
    code, res = send_request("/payments/update/502/", method="PUT", data=update_payment_data)
    print(f"PUT /payments/update/502/: Code {code}, Message: {res}")
    
    # DELETE delete
    code, res = send_request("/payments/delete/502/", method="DELETE")
    print(f"DELETE /payments/delete/502/: Code {code}, Message: {res}")

    print("\nAPI Verification Tests Completed.")

if __name__ == '__main__':
    run_tests()
