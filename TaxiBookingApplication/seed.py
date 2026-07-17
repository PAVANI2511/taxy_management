import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'db.sqlite3'

def seed():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Seed Customer
    cursor.execute("SELECT COUNT(*) FROM customers WHERE customer_id = 101")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO customers (customer_id, full_name, email, phone, address, password)
            VALUES (101, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Hyderabad', 'rahul123')
        """)
        print("Customer seeded.")
    else:
        print("Customer already exists.")

    # 2. Seed Driver
    cursor.execute("SELECT COUNT(*) FROM drivers WHERE driver_id = 201")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO drivers (driver_id, driver_name, email, phone, license_number, experience, availability, password)
            VALUES (201, 'Ramesh Kumar', 'ramesh@gmail.com', '9988776655', 'DL123456789', 5, 'Available', 'driver123')
        """)
        print("Driver seeded.")
    else:
        print("Driver already exists.")

    # 3. Seed Vehicle
    cursor.execute("SELECT COUNT(*) FROM vehicles WHERE vehicle_id = 301")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO vehicles (vehicle_id, driver_name, vehicle_type, vehicle_number, seating_capacity, model)
            VALUES (301, 'Ramesh Kumar', 'Sedan', 'TS09AB1234', 4, 'Hyundai Verna')
        """)
        print("Vehicle seeded.")
    else:
        print("Vehicle already exists.")

    # 4. Seed Booking
    cursor.execute("SELECT COUNT(*) FROM bookings WHERE booking_id = 401")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO bookings (booking_id, customer_name, driver_name, pickup_location, drop_location, booking_date, fare, ride_status)
            VALUES (401, 'Rahul Sharma', 'Ramesh Kumar', 'Madhapur', 'Gachibowli', '2026-08-15', 350, 'Accepted')
        """)
        print("Booking seeded.")
    else:
        print("Booking already exists.")

    # 5. Seed Payment
    cursor.execute("SELECT COUNT(*) FROM payments WHERE payment_id = 501")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO payments (payment_id, booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date)
            VALUES (501, 401, 'Rahul Sharma', 350, 'UPI', 'Success', 'TXN456789123', '2026-08-15')
        """)
        print("Payment seeded.")
    else:
        print("Payment already exists.")

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed()
