import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / 'db.sqlite3'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Customers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        address TEXT,
        password TEXT NOT NULL
    );
    """)
    
    # 2. Drivers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drivers (
        driver_id INTEGER PRIMARY KEY,
        driver_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        license_number TEXT,
        experience INTEGER DEFAULT 0,
        availability TEXT DEFAULT 'Available',
        password TEXT
    );
    """)
    
    # 3. Vehicles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        vehicle_id INTEGER PRIMARY KEY,
        driver_name TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        vehicle_number TEXT UNIQUE NOT NULL,
        seating_capacity INTEGER NOT NULL,
        model TEXT NOT NULL
    );
    """)
    
    # 4. Bookings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        driver_name TEXT,
        pickup_location TEXT NOT NULL,
        drop_location TEXT NOT NULL,
        booking_date TEXT NOT NULL,
        fare REAL NOT NULL,
        ride_status TEXT DEFAULT 'Requested'
    );
    """)
    
    # 5. Payments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'Pending',
        transaction_id TEXT,
        payment_date TEXT NOT NULL
    );
    """)
    
    conn.commit()
    conn.close()

# Helper to serialize sqlite3.Row to dict
def row_to_dict(row):
    if row is None:
        return None
    return dict(row)

# --- CUSTOMER CRUD ---
def add_customer(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO customers (customer_id, full_name, email, phone, address, password)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get('customer_id'),
            data.get('full_name'),
            data.get('email'),
            data.get('phone'),
            data.get('address'),
            data.get('password')
        ))
        conn.commit()
        return True, "Customer added successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def get_customer_by_id(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (customer_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_customer(customer_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Build query dynamically based on present keys
        fields = []
        values = []
        for key in ['full_name', 'email', 'phone', 'address', 'password']:
            if key in data:
                fields.append(f"{key} = ?")
                values.append(data[key])
        if not fields:
            return True, "No fields to update"
        values.append(customer_id)
        cursor.execute(f"UPDATE customers SET {', '.join(fields)} WHERE customer_id = ?", values)
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Customer not found"
        return True, "Customer updated successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def delete_customer(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM customers WHERE customer_id = ?", (customer_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Customer not found"
        return True, "Customer deleted successfully"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()


# --- DRIVER CRUD ---
def add_driver(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO drivers (driver_id, driver_name, email, phone, license_number, experience, availability, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('driver_id'),
            data.get('driver_name'),
            data.get('email'),
            data.get('phone'),
            data.get('license_number'),
            data.get('experience', 0),
            data.get('availability', 'Available'),
            data.get('password', 'driver123')
        ))
        conn.commit()
        return True, "Driver added successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def get_drivers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM drivers")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def get_driver_by_id(driver_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM drivers WHERE driver_id = ?", (driver_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_driver(driver_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = []
        values = []
        for key in ['driver_name', 'email', 'phone', 'license_number', 'experience', 'availability', 'password']:
            if key in data:
                fields.append(f"{key} = ?")
                values.append(data[key])
        if not fields:
            return True, "No fields to update"
        values.append(driver_id)
        cursor.execute(f"UPDATE drivers SET {', '.join(fields)} WHERE driver_id = ?", values)
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Driver not found"
        return True, "Driver updated successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def delete_driver(driver_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM drivers WHERE driver_id = ?", (driver_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Driver not found"
        return True, "Driver deleted successfully"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()


# --- VEHICLE CRUD ---
def add_vehicle(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO vehicles (vehicle_id, driver_name, vehicle_type, vehicle_number, seating_capacity, model)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get('vehicle_id'),
            data.get('driver_name'),
            data.get('vehicle_type'),
            data.get('vehicle_number'),
            data.get('seating_capacity'),
            data.get('model')
        ))
        conn.commit()
        return True, "Vehicle added successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def get_vehicles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def get_vehicle_by_id(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE vehicle_id = ?", (vehicle_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_vehicle(vehicle_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = []
        values = []
        for key in ['driver_name', 'vehicle_type', 'vehicle_number', 'seating_capacity', 'model']:
            if key in data:
                fields.append(f"{key} = ?")
                values.append(data[key])
        if not fields:
            return True, "No fields to update"
        values.append(vehicle_id)
        cursor.execute(f"UPDATE vehicles SET {', '.join(fields)} WHERE vehicle_id = ?", values)
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Vehicle not found"
        return True, "Vehicle updated successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def delete_vehicle(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM vehicles WHERE vehicle_id = ?", (vehicle_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Vehicle not found"
        return True, "Vehicle deleted successfully"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()


# --- RIDE BOOKING CRUD ---
def add_booking(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO bookings (booking_id, customer_name, driver_name, pickup_location, drop_location, booking_date, fare, ride_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('booking_id'),
            data.get('customer_name'),
            data.get('driver_name'),
            data.get('pickup_location'),
            data.get('drop_location'),
            data.get('booking_date'),
            data.get('fare'),
            data.get('ride_status', 'Requested')
        ))
        conn.commit()
        return True, "Booking added successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def get_bookings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def get_booking_by_id(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (booking_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_booking(booking_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = []
        values = []
        for key in ['customer_name', 'driver_name', 'pickup_location', 'drop_location', 'booking_date', 'fare', 'ride_status']:
            if key in data:
                fields.append(f"{key} = ?")
                values.append(data[key])
        if not fields:
            return True, "No fields to update"
        values.append(booking_id)
        cursor.execute(f"UPDATE bookings SET {', '.join(fields)} WHERE booking_id = ?", values)
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Booking not found"
        return True, "Booking updated successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def delete_booking(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM bookings WHERE booking_id = ?", (booking_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Booking not found"
        return True, "Booking deleted successfully"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()


# --- PAYMENT CRUD ---
def add_payment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO payments (payment_id, booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('payment_id'),
            data.get('booking_id'),
            data.get('customer_name'),
            data.get('amount'),
            data.get('payment_method'),
            data.get('payment_status', 'Pending'),
            data.get('transaction_id'),
            data.get('payment_date')
        ))
        conn.commit()
        return True, "Payment added successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def get_payments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments")
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def get_payment_by_id(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (payment_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row)

def update_payment(payment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        fields = []
        values = []
        for key in ['booking_id', 'customer_name', 'amount', 'payment_method', 'payment_status', 'transaction_id', 'payment_date']:
            if key in data:
                fields.append(f"{key} = ?")
                values.append(data[key])
        if not fields:
            return True, "No fields to update"
        values.append(payment_id)
        cursor.execute(f"UPDATE payments SET {', '.join(fields)} WHERE payment_id = ?", values)
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Payment not found"
        return True, "Payment updated successfully"
    except sqlite3.IntegrityError as e:
        return False, f"Integrity error: {str(e)}"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

def delete_payment(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM payments WHERE payment_id = ?", (payment_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return False, "Payment not found"
        return True, "Payment deleted successfully"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

# Initialize tables when imported
init_db()
