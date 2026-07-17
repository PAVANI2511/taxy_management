const API_BASE = 'http://127.0.0.1:8000';

// Global Auth State Helper
function getAuthState() {
    const userJson = localStorage.getItem('currentUser');
    return {
        user: userJson ? JSON.parse(userJson) : null,
        role: localStorage.getItem('userRole') || null
    };
}

function setAuthState(user, role) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', role);
}

function clearAuthState() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
}

// Global Alert Banner
function showAlert(message, type = 'success') {
    const banner = document.getElementById('alert-banner');
    if (!banner) return;
    banner.innerText = message;
    banner.className = `alert-banner alert-${type}`;
    banner.style.display = 'block';
    setTimeout(() => {
        banner.style.display = 'none';
    }, 4500);
}

// Update Header Links on Load
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderNavigation();
});

function updateHeaderNavigation() {
    const state = getAuthState();
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const authBtn = document.getElementById('nav-auth-btn');
    const userProfile = document.getElementById('nav-user-profile');
    const customerDash = document.getElementById('nav-customer-dash');
    const driverDash = document.getElementById('nav-driver-dash');
    const adminDash = document.getElementById('nav-admin-dash');

    if (state.user && state.role) {
        // Logged in
        authBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        userProfile.innerHTML = `
            <div class="user-badge">
                <i class="fa-solid fa-user"></i> 
                <span>${state.role === 'admin' ? 'Admin' : (state.user.full_name || state.user.driver_name)}</span>
                <span class="role">${state.role}</span>
                <button class="nav-logout" onclick="handleLogout()" style="margin-left: 0.5rem;"><i class="fa-solid fa-power-off"></i></button>
            </div>
        `;

        // Toggles dashboards
        if (state.role === 'customer') {
            customerDash.style.display = 'block';
            driverDash.style.display = 'none';
            adminDash.style.display = 'none';
        } else if (state.role === 'driver') {
            customerDash.style.display = 'none';
            driverDash.style.display = 'block';
            adminDash.style.display = 'none';
        } else if (state.role === 'admin') {
            customerDash.style.display = 'none';
            driverDash.style.display = 'none';
            adminDash.style.display = 'block';
        }
    } else {
        // Not logged in
        authBtn.style.display = 'block';
        userProfile.style.display = 'none';
        customerDash.style.display = 'none';
        driverDash.style.display = 'none';
        adminDash.style.display = 'none';
    }
}

function handleLogout() {
    clearAuthState();
    showAlert('Logged out successfully.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// =====================================================================
// AUTH & REGISTRATION FLOWS
// =====================================================================

// Handle Registration form submission
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = document.getElementById('register-role').value;

        if (role === 'customer') {
            const data = {
                customer_id: parseInt(document.getElementById('cust-id').value),
                full_name: document.getElementById('cust-name').value.trim(),
                email: document.getElementById('cust-email').value.trim(),
                phone: document.getElementById('cust-phone').value.trim(),
                address: document.getElementById('cust-address').value.trim(),
                password: document.getElementById('cust-password').value
            };

            try {
                const response = await fetch(`${API_BASE}/customers/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const resData = await response.json();
                if (response.ok) {
                    showAlert('Customer registered successfully!');
                    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                } else {
                    showAlert(resData.error || 'Failed to register customer.', 'error');
                }
            } catch (err) {
                showAlert('Network error: cannot reach backend API.', 'error');
            }
        } else {
            // Driver role
            const data = {
                driver_id: parseInt(document.getElementById('driver-id').value),
                driver_name: document.getElementById('driver-name').value.trim(),
                email: document.getElementById('driver-email').value.trim(),
                phone: document.getElementById('driver-phone').value.trim(),
                license_number: document.getElementById('driver-license').value.trim(),
                experience: parseInt(document.getElementById('driver-experience').value) || 0,
                availability: 'Available',
                password: document.getElementById('driver-password').value
            };

            try {
                const response = await fetch(`${API_BASE}/drivers/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const resData = await response.json();
                if (response.ok) {
                    showAlert('Driver registered successfully!');
                    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                } else {
                    showAlert(resData.error || 'Failed to register driver.', 'error');
                }
            } catch (err) {
                showAlert('Network error: cannot reach backend API.', 'error');
            }
        }
    });
}

// Handle Login Form Submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        // Admin hardcoded login
        if (role === 'admin') {
            if (email === 'admin@taxigo.com' && password === 'admin123') {
                setAuthState({ email: 'admin@taxigo.com', full_name: 'Admin User' }, 'admin');
                showAlert('Admin logged in successfully!');
                setTimeout(() => { window.location.href = 'admin_dashboard.html'; }, 1500);
            } else {
                showAlert('Invalid administrator credentials.', 'error');
            }
            return;
        }

        // Customer Login
        if (role === 'customer') {
            try {
                const response = await fetch(`${API_BASE}/customers/`);
                if (!response.ok) throw new Error('API failed');
                const customers = await response.json();
                const matched = customers.find(c => c.email === email && c.password === password);
                if (matched) {
                    setAuthState(matched, 'customer');
                    showAlert('Logged in successfully!');
                    setTimeout(() => { window.location.href = 'customer_dashboard.html'; }, 1500);
                } else {
                    showAlert('Invalid email or password.', 'error');
                }
            } catch (err) {
                showAlert('Cannot verify login. Is the server running?', 'error');
            }
        }

        // Driver Login
        if (role === 'driver') {
            try {
                const response = await fetch(`${API_BASE}/drivers/`);
                if (!response.ok) throw new Error('API failed');
                const drivers = await response.json();
                const matched = drivers.find(d => d.email === email && d.password === password);
                if (matched) {
                    setAuthState(matched, 'driver');
                    showAlert('Logged in successfully!');
                    setTimeout(() => { window.location.href = 'driver_dashboard.html'; }, 1500);
                } else {
                    showAlert('Invalid email or password.', 'error');
                }
            } catch (err) {
                showAlert('Cannot verify login. Is the server running?', 'error');
            }
        }
    });
}

// =====================================================================
// DRIVERS PAGE
// =====================================================================
async function loadDriversPage() {
    const grid = document.getElementById('drivers-grid');
    if (!grid) return;

    try {
        const dRes = await fetch(`${API_BASE}/drivers/`);
        const vRes = await fetch(`${API_BASE}/vehicles/`);
        
        if (!dRes.ok || !vRes.ok) throw new Error('Failed to load drivers');

        const drivers = await dRes.json();
        const vehicles = await vRes.json();

        if (drivers.length === 0) {
            grid.innerHTML = `<div class="metric-card" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No drivers registered yet.</div>`;
            return;
        }

        grid.innerHTML = '';
        drivers.forEach(driver => {
            // Find driver's vehicle
            const vehicle = vehicles.find(v => v.driver_name.toLowerCase() === driver.driver_name.toLowerCase());
            
            // Availability Badge
            let badgeClass = 'badge-offline';
            if (driver.availability === 'Available') badgeClass = 'badge-completed';
            else if (driver.availability === 'Busy') badgeClass = 'badge-requested';

            grid.innerHTML += `
                <div class="destination-card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <h3>${driver.driver_name}</h3>
                        <span class="badge ${badgeClass}">${driver.availability}</span>
                    </div>
                    <p><strong>Experience:</strong> ${driver.experience} Years</p>
                    <p><strong>License:</strong> ${driver.license_number}</p>
                    <p><strong>Phone:</strong> ${driver.phone}</p>
                    <div style="margin-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.8rem;">
                        <p style="color: var(--accent); font-weight: 600;">
                            <i class="fa-solid fa-car"></i> 
                            ${vehicle ? `${vehicle.model} (${vehicle.vehicle_type})` : 'No Vehicle Assigned'}
                        </p>
                        ${vehicle ? `<p style="font-size: 0.8rem; color: var(--text-secondary);">Number: ${vehicle.vehicle_number} | Capacity: ${vehicle.seating_capacity} Seats</p>` : ''}
                    </div>
                </div>
            `;
        });
    } catch (err) {
        grid.innerHTML = `<div class="metric-card" style="grid-column: 1/-1; text-align: center; color: var(--error); padding: 2rem;">Error reaching backend API.</div>`;
    }
}

// =====================================================================
// RIDE BOOKING
// =====================================================================
async function submitBooking() {
    const state = getAuthState();
    if (!state.user || state.role !== 'customer') {
        showAlert('Please login as a Customer to book a ride.', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return;
    }

    const pickup = document.getElementById('pickup-loc').value.trim();
    const drop = document.getElementById('drop-loc').value.trim();
    const date = document.getElementById('booking-date').value;
    const totalText = document.getElementById('summary-total').innerText;
    const fare = parseFloat(totalText.replace('₹', '')) || 0;

    if (!pickup || !drop || !date || fare === 0) {
        showAlert('Please fill in pickup/drop locations to calculate fare.', 'error');
        return;
    }

    try {
        // 1. Fetch available drivers
        const dRes = await fetch(`${API_BASE}/drivers/`);
        const drivers = await dRes.json();
        
        // Find driver with availability = 'Available'
        const availableDriver = drivers.find(d => d.availability === 'Available');
        const driverName = availableDriver ? availableDriver.driver_name : 'No Driver Assigned';

        // Generate Booking ID (timestamp or count + 400)
        const bRes = await fetch(`${API_BASE}/bookings/`);
        const bookings = await bRes.json();
        const bookingId = 401 + bookings.length + Math.floor(Math.random() * 100);

        const bookingData = {
            booking_id: bookingId,
            customer_name: state.user.full_name,
            driver_name: driverName,
            pickup_location: pickup,
            drop_location: drop,
            booking_date: date,
            fare: fare,
            ride_status: availableDriver ? 'Accepted' : 'Requested'
        };

        // 2. Add booking
        const response = await fetch(`${API_BASE}/bookings/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            // 3. If driver was assigned, update driver availability status to 'Busy'
            if (availableDriver) {
                await fetch(`${API_BASE}/drivers/update/${availableDriver.driver_id}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ availability: 'Busy' })
                });
            }

            showAlert('Booking created successfully! Redirecting to payment...');
            setTimeout(() => {
                window.location.href = `payments.html?booking_id=${bookingId}`;
            }, 1500);
        } else {
            const resData = await response.json();
            showAlert(resData.error || 'Failed to submit booking.', 'error');
        }
    } catch (err) {
        showAlert('Network error: failed to connect to API.', 'error');
    }
}

// =====================================================================
// PAYMENT PROCESS
// =====================================================================
let currentCheckoutBooking = null;

async function initCheckoutPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = parseInt(urlParams.get('booking_id'));
    const container = document.getElementById('checkout-details');
    
    if (!bookingId || isNaN(bookingId)) {
        container.innerHTML = `<p style="color:var(--error); text-align:center;">No valid booking ID specified in URL.</p>`;
        document.getElementById('pay-now-btn').disabled = true;
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bookings/`);
        const bookings = await response.json();
        const booking = bookings.find(b => b.booking_id === bookingId);
        
        if (!booking) {
            container.innerHTML = `<p style="color:var(--error); text-align:center;">Booking reference #${bookingId} not found.</p>`;
            document.getElementById('pay-now-btn').disabled = true;
            return;
        }

        currentCheckoutBooking = booking;
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                <span style="color:var(--text-secondary);">Booking ID:</span>
                <strong>#${booking.booking_id}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                <span style="color:var(--text-secondary);">Customer Name:</span>
                <strong>${booking.customer_name}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                <span style="color:var(--text-secondary);">Assigned Driver:</span>
                <strong>${booking.driver_name}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 0.8rem;">
                <span style="color:var(--text-secondary);">Route:</span>
                <strong>${booking.pickup_location} &rarr; ${booking.drop_location}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.8rem;">
                <span style="font-size:1.1rem; font-weight:700;">Total Fare:</span>
                <span style="font-size:1.4rem; font-weight:800; color:var(--accent);">₹${booking.fare}</span>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p style="color:var(--error); text-align:center;">Failed to connect to backend database.</p>`;
    }
}

async function processPayment(event) {
    event.preventDefault();
    if (!currentCheckoutBooking) return;

    const method = document.getElementById('pay-method').value;
    const txId = 'TXN' + Date.now().toString().slice(-9) + Math.floor(Math.random() * 100);
    const dateStr = new Date().toISOString().split('T')[0];

    const paymentId = 501 + Math.floor(Math.random() * 1000);

    const paymentData = {
        payment_id: paymentId,
        booking_id: currentCheckoutBooking.booking_id,
        customer_name: currentCheckoutBooking.customer_name,
        amount: currentCheckoutBooking.fare,
        payment_method: method,
        payment_status: 'Success',
        transaction_id: txId,
        payment_date: dateStr
    };

    try {
        const response = await fetch(`${API_BASE}/payments/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });

        if (response.ok) {
            // Update booking status to In Progress
            await fetch(`${API_BASE}/bookings/update/${currentCheckoutBooking.booking_id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ride_status: 'In Progress' })
            });

            showAlert('Payment successful! Your ride is confirmed.');
            setTimeout(() => {
                window.location.href = 'ride_history.html';
            }, 1500);
        } else {
            showAlert('Failed to process payment.', 'error');
        }
    } catch (err) {
        showAlert('Error processing transaction.', 'error');
    }
}

// =====================================================================
// RIDE HISTORY PAGE
// =====================================================================
async function initRideHistoryPage() {
    const state = getAuthState();
    const tbody = document.getElementById('ride-history-tbody');
    if (!tbody) return;

    if (!state.user || state.role !== 'customer') {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">Please <a href="login.html" style="color:var(--accent);">login as Customer</a> to view ride history.</td></tr>`;
        return;
    }

    try {
        const bRes = await fetch(`${API_BASE}/bookings/`);
        const pRes = await fetch(`${API_BASE}/payments/`);
        
        const bookings = await bRes.json();
        const payments = await pRes.json();

        // Filter bookings by logged-in customer name
        const myBookings = bookings.filter(b => b.customer_name === state.user.full_name);

        if (myBookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">No bookings found. Get started by <a href="booking.html" style="color:var(--accent);">booking your first ride!</a></td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        myBookings.forEach(booking => {
            const pay = payments.find(p => p.booking_id === booking.booking_id);
            const payStatus = pay ? pay.payment_status : 'Pending';
            
            let statusBadge = 'badge-requested';
            if (booking.ride_status === 'Accepted') statusBadge = 'badge-accepted';
            else if (booking.ride_status === 'In Progress') statusBadge = 'badge-inprogress';
            else if (booking.ride_status === 'Completed') statusBadge = 'badge-completed';
            else if (booking.ride_status === 'Cancelled') statusBadge = 'badge-cancelled';

            let payBadge = 'badge-pending';
            if (payStatus === 'Success') payBadge = 'badge-success';
            else if (payStatus === 'Failed') payBadge = 'badge-failed';

            let actionBtn = '';
            if (booking.ride_status === 'Requested' || booking.ride_status === 'Accepted') {
                actionBtn = `<button class="action-btn action-btn-delete" onclick="cancelRide(${booking.booking_id})">Cancel</button>`;
            } else if (booking.ride_status === 'Completed' && payStatus === 'Pending') {
                actionBtn = `<a href="payments.html?booking_id=${booking.booking_id}" class="action-btn action-btn-success" style="text-decoration:none; display:inline-block;">Pay</a>`;
            } else {
                actionBtn = `<span style="color:var(--text-secondary); font-size:0.8rem;">None</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>#${booking.booking_id}</td>
                    <td>${booking.driver_name}</td>
                    <td>${booking.pickup_location} &rarr; ${booking.drop_location}</td>
                    <td>${booking.booking_date}</td>
                    <td>₹${booking.fare}</td>
                    <td><span class="badge ${statusBadge}">${booking.ride_status}</span></td>
                    <td><span class="badge ${payBadge}">${payStatus}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--error); padding: 2rem;">Error reaching backend API.</td></tr>`;
    }
}

async function cancelRide(bookingId) {
    if (!confirm('Are you sure you want to cancel this ride request?')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings/update/${bookingId}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ride_status: 'Cancelled' })
        });

        if (response.ok) {
            showAlert('Ride cancelled successfully.');
            // Retrieve booking driver to make them available again
            const bRes = await fetch(`${API_BASE}/bookings/`);
            const bookings = await bRes.json();
            const booking = bookings.find(b => b.booking_id === bookingId);
            
            if (booking && booking.driver_name !== 'No Driver Assigned') {
                const dRes = await fetch(`${API_BASE}/drivers/`);
                const drivers = await dRes.json();
                const driver = drivers.find(d => d.driver_name === booking.driver_name);
                if (driver) {
                    await fetch(`${API_BASE}/drivers/update/${driver.driver_id}/`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ availability: 'Available' })
                    });
                }
            }
            initRideHistoryPage();
        } else {
            showAlert('Failed to cancel ride.', 'error');
        }
    } catch (err) {
        showAlert('Network error during cancellation.', 'error');
    }
}

// =====================================================================
// CUSTOMER DASHBOARD
// =====================================================================
async function initCustomerDashboard() {
    const state = getAuthState();
    const tbody = document.getElementById('cust-dashboard-tbody');
    if (!tbody) return;

    if (!state.user || state.role !== 'customer') {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">Please <a href="login.html" style="color:var(--accent);">login as Customer</a>.</td></tr>`;
        return;
    }

    try {
        const bRes = await fetch(`${API_BASE}/bookings/`);
        const pRes = await fetch(`${API_BASE}/payments/`);
        
        const bookings = await bRes.json();
        const payments = await pRes.json();

        const myBookings = bookings.filter(b => b.customer_name === state.user.full_name);

        const totalRides = myBookings.length;
        const completedRides = myBookings.filter(b => b.ride_status === 'Completed').length;
        const upcomingRides = myBookings.filter(b => ['Requested', 'Accepted', 'In Progress'].includes(b.ride_status)).length;
        
        let totalSpent = 0;
        myBookings.forEach(b => {
            const pay = payments.find(p => p.booking_id === b.booking_id);
            if (pay && pay.payment_status === 'Success') {
                totalSpent += b.fare;
            }
        });

        document.getElementById('cust-total-rides').innerText = totalRides;
        document.getElementById('cust-completed-rides').innerText = completedRides;
        document.getElementById('cust-upcoming-rides').innerText = upcomingRides;
        document.getElementById('cust-total-spent').innerText = '₹' + totalSpent;

        if (totalRides === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem;">No bookings found. <a href="booking.html" style="color:var(--accent);">Book a ride!</a></td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        myBookings.forEach(booking => {
            const pay = payments.find(p => p.booking_id === booking.booking_id);
            const payStatus = pay ? pay.payment_status : 'Pending';
            const payMethod = pay ? pay.payment_method : 'Not Paid';

            let statusBadge = 'badge-requested';
            if (booking.ride_status === 'Accepted') statusBadge = 'badge-accepted';
            else if (booking.ride_status === 'In Progress') statusBadge = 'badge-inprogress';
            else if (booking.ride_status === 'Completed') statusBadge = 'badge-completed';
            else if (booking.ride_status === 'Cancelled') statusBadge = 'badge-cancelled';

            let payBadge = 'badge-pending';
            if (payStatus === 'Success') payBadge = 'badge-success';
            else if (payStatus === 'Failed') payBadge = 'badge-failed';

            tbody.innerHTML += `
                <tr>
                    <td>#${booking.booking_id}</td>
                    <td>${booking.driver_name}</td>
                    <td>${booking.pickup_location} &rarr; ${booking.drop_location}</td>
                    <td>${booking.booking_date}</td>
                    <td>₹${booking.fare}</td>
                    <td><span class="badge ${statusBadge}">${booking.ride_status}</span></td>
                    <td>${payMethod}</td>
                    <td><span class="badge ${payBadge}">${payStatus}</span></td>
                </tr>
            `;
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--error);">Failed to load dashboard data.</td></tr>`;
    }
}

// =====================================================================
// DRIVER DASHBOARD
// =====================================================================
async function initDriverDashboard() {
    const state = getAuthState();
    const tbody = document.getElementById('driver-dashboard-tbody');
    if (!tbody) return;

    if (!state.user || state.role !== 'driver') {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">Please <a href="login.html" style="color:var(--accent);">login as Driver</a>.</td></tr>`;
        return;
    }

    // Highlighting availability buttons
    document.querySelectorAll('.avail-btn').forEach(btn => btn.classList.remove('active-avail'));
    const currentStatus = state.user.availability || 'Offline';
    const activeBtn = document.getElementById(`avail-${currentStatus}`);
    if (activeBtn) activeBtn.classList.add('active-avail');

    document.getElementById('driver-active-status').innerText = currentStatus;

    try {
        const bRes = await fetch(`${API_BASE}/bookings/`);
        const bookings = await bRes.json();

        const myBookings = bookings.filter(b => b.driver_name === state.user.driver_name);

        const totalTrips = myBookings.length;
        const completedTrips = myBookings.filter(b => b.ride_status === 'Completed').length;
        
        let earnings = 0;
        myBookings.forEach(b => {
            if (b.ride_status === 'Completed') {
                earnings += b.fare;
            }
        });

        document.getElementById('driver-total-trips').innerText = totalTrips;
        document.getElementById('driver-completed-trips').innerText = completedTrips;
        document.getElementById('driver-earnings').innerText = '₹' + earnings;

        if (totalTrips === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No trips assigned to you yet. Set your status to 'Available' to receive requests.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        myBookings.forEach(booking => {
            let statusBadge = 'badge-requested';
            if (booking.ride_status === 'Accepted') statusBadge = 'badge-accepted';
            else if (booking.ride_status === 'In Progress') statusBadge = 'badge-inprogress';
            else if (booking.ride_status === 'Completed') statusBadge = 'badge-completed';
            else if (booking.ride_status === 'Cancelled') statusBadge = 'badge-cancelled';

            let actionBtn = '';
            if (booking.ride_status === 'Requested') {
                actionBtn = `
                    <div class="action-btn-group">
                        <button class="action-btn action-btn-success" onclick="updateRideStatus(${booking.booking_id}, 'Accepted')">Accept</button>
                        <button class="action-btn action-btn-delete" onclick="updateRideStatus(${booking.booking_id}, 'Cancelled')">Cancel</button>
                    </div>
                `;
            } else if (booking.ride_status === 'Accepted') {
                actionBtn = `<button class="action-btn action-btn-edit" style="background:#8b5cf6; color:#fff;" onclick="updateRideStatus(${booking.booking_id}, 'In Progress')">Start Ride</button>`;
            } else if (booking.ride_status === 'In Progress') {
                actionBtn = `<button class="action-btn action-btn-success" onclick="updateRideStatus(${booking.booking_id}, 'Completed')">Complete Ride</button>`;
            } else {
                actionBtn = `<span style="color:var(--text-secondary); font-size:0.8rem;">Finished</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>#${booking.booking_id}</td>
                    <td>${booking.customer_name}</td>
                    <td>${booking.pickup_location}</td>
                    <td>${booking.drop_location}</td>
                    <td>₹${booking.fare}</td>
                    <td><span class="badge ${statusBadge}">${booking.ride_status}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color:var(--error);">Failed to load assigned trips.</td></tr>`;
    }
}

async function updateDriverStatus(newStatus) {
    const state = getAuthState();
    if (!state.user || state.role !== 'driver') return;

    try {
        const response = await fetch(`${API_BASE}/drivers/update/${state.user.driver_id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availability: newStatus })
        });

        if (response.ok) {
            state.user.availability = newStatus;
            setAuthState(state.user, 'driver');
            showAlert(`Status updated to ${newStatus}.`);
            initDriverDashboard();
        } else {
            showAlert('Failed to update status on server.', 'error');
        }
    } catch (err) {
        showAlert('Network error updating status.', 'error');
    }
}

async function updateRideStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE}/bookings/update/${bookingId}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ride_status: status })
        });

        if (response.ok) {
            showAlert(`Ride updated to: ${status}`);

            // If ride was cancelled or completed, release the driver to "Available"
            if (status === 'Cancelled' || status === 'Completed') {
                const state = getAuthState();
                await fetch(`${API_BASE}/drivers/update/${state.user.driver_id}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ availability: 'Available' })
                });
                state.user.availability = 'Available';
                setAuthState(state.user, 'driver');
            }

            initDriverDashboard();
        } else {
            showAlert('Failed to update ride status.', 'error');
        }
    } catch (err) {
        showAlert('Network error updating ride.', 'error');
    }
}

// =====================================================================
// ADMIN DASHBOARD
// =====================================================================
let currentAdminTab = 'customers';

function switchAdminTab(tabName) {
    currentAdminTab = tabName;
    document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    
    // Set active link
    const activeLink = Array.from(document.querySelectorAll('.tab-link')).find(el => el.innerText.toLowerCase().includes(tabName));
    if (activeLink) activeLink.classList.add('active');

    // Show active content
    const targetContent = document.getElementById(`tab-${tabName}`);
    if (targetContent) targetContent.classList.add('active');

    loadAdminTabData(tabName);
}

function initAdminDashboard() {
    const state = getAuthState();
    if (!state.user || state.role !== 'admin') {
        document.querySelector('main').innerHTML = `<div class="auth-container" style="text-align:center;"><p>Please <a href="login.html" style="color:var(--accent);">login as Administrator</a>.</p></div>`;
        return;
    }
    loadAdminTabData('customers');
}

async function loadAdminTabData(tabName) {
    const tbody = document.getElementById(`admin-${tabName}-tbody`);
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="10" style="text-align:center; padding: 2rem;">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; color: var(--accent);"></i>
            </td>
        </tr>
    `;

    try {
        const response = await fetch(`${API_BASE}/${tabName}/`);
        if (!response.ok) throw new Error();
        const records = await response.json();

        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 1.5rem; color:var(--text-secondary);">No records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        records.forEach(rec => {
            let rowHtml = '';
            
            if (tabName === 'customers') {
                rowHtml = `
                    <tr>
                        <td>${rec.customer_id}</td>
                        <td>${rec.full_name}</td>
                        <td>${rec.email}</td>
                        <td>${rec.phone}</td>
                        <td>${rec.address}</td>
                        <td>
                            <div class="action-btn-group">
                                <button class="action-btn action-btn-edit" onclick="openAdminModal('customer', 'edit', ${rec.customer_id})">Edit</button>
                                <button class="action-btn action-btn-delete" onclick="deleteAdminRecord('customers', ${rec.customer_id})">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabName === 'drivers') {
                let badgeClass = 'badge-offline';
                if (rec.availability === 'Available') badgeClass = 'badge-completed';
                else if (rec.availability === 'Busy') badgeClass = 'badge-requested';

                rowHtml = `
                    <tr>
                        <td>${rec.driver_id}</td>
                        <td>${rec.driver_name}</td>
                        <td>${rec.email}</td>
                        <td>${rec.phone}</td>
                        <td>${rec.license_number}</td>
                        <td>${rec.experience} yrs</td>
                        <td><span class="badge ${badgeClass}">${rec.availability}</span></td>
                        <td>
                            <div class="action-btn-group">
                                <button class="action-btn action-btn-edit" onclick="openAdminModal('driver', 'edit', ${rec.driver_id})">Edit</button>
                                <button class="action-btn action-btn-delete" onclick="deleteAdminRecord('drivers', ${rec.driver_id})">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabName === 'vehicles') {
                rowHtml = `
                    <tr>
                        <td>${rec.vehicle_id}</td>
                        <td>${rec.driver_name}</td>
                        <td>${rec.vehicle_type}</td>
                        <td>${rec.vehicle_number}</td>
                        <td>${rec.seating_capacity} seats</td>
                        <td>${rec.model}</td>
                        <td>
                            <div class="action-btn-group">
                                <button class="action-btn action-btn-edit" onclick="openAdminModal('vehicle', 'edit', ${rec.vehicle_id})">Edit</button>
                                <button class="action-btn action-btn-delete" onclick="deleteAdminRecord('vehicles', ${rec.vehicle_id})">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabName === 'bookings') {
                let statusBadge = 'badge-requested';
                if (rec.ride_status === 'Accepted') statusBadge = 'badge-accepted';
                else if (rec.ride_status === 'In Progress') statusBadge = 'badge-inprogress';
                else if (rec.ride_status === 'Completed') statusBadge = 'badge-completed';
                else if (rec.ride_status === 'Cancelled') statusBadge = 'badge-cancelled';

                rowHtml = `
                    <tr>
                        <td>#${rec.booking_id}</td>
                        <td>${rec.customer_name}</td>
                        <td>${rec.driver_name}</td>
                        <td>${rec.pickup_location}</td>
                        <td>${rec.drop_location}</td>
                        <td>${rec.booking_date}</td>
                        <td>₹${rec.fare}</td>
                        <td><span class="badge ${statusBadge}">${rec.ride_status}</span></td>
                        <td>
                            <div class="action-btn-group">
                                <button class="action-btn action-btn-edit" onclick="openAdminModal('booking', 'edit', ${rec.booking_id})">Edit</button>
                                <button class="action-btn action-btn-delete" onclick="deleteAdminRecord('bookings', ${rec.booking_id})">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            } else if (tabName === 'payments') {
                let payBadge = 'badge-pending';
                if (rec.payment_status === 'Success') payBadge = 'badge-success';
                else if (rec.payment_status === 'Failed') payBadge = 'badge-failed';

                rowHtml = `
                    <tr>
                        <td>#${rec.payment_id}</td>
                        <td>#${rec.booking_id}</td>
                        <td>${rec.customer_name}</td>
                        <td>₹${rec.amount}</td>
                        <td>${rec.payment_method}</td>
                        <td><span class="badge ${payBadge}">${rec.payment_status}</span></td>
                        <td><code>${rec.transaction_id || 'N/A'}</code></td>
                        <td>${rec.payment_date}</td>
                        <td>
                            <div class="action-btn-group">
                                <button class="action-btn action-btn-edit" onclick="openAdminModal('payment', 'edit', ${rec.payment_id})">Edit</button>
                                <button class="action-btn action-btn-delete" onclick="deleteAdminRecord('payments', ${rec.payment_id})">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            }

            tbody.innerHTML += rowHtml;
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--error); padding: 1.5rem;">Error loading records.</td></tr>`;
    }
}

// Modal open/close handlers
function closeAdminModal() {
    document.getElementById('admin-crud-modal').classList.remove('active');
}

async function openAdminModal(schemaType, action, recordId = null) {
    const modal = document.getElementById('admin-crud-modal');
    const formContainer = document.getElementById('modal-fields-container');
    const title = document.getElementById('modal-title');
    
    document.getElementById('modal-schema-type').value = schemaType;
    document.getElementById('modal-action-type').value = action;
    document.getElementById('modal-record-id').value = recordId || '';

    title.innerText = `${action === 'add' ? 'Add' : 'Edit'} ${schemaType.toUpperCase()}`;
    formContainer.innerHTML = '';
    modal.classList.add('active');

    // Retrieve existing record data if editing
    let currentRec = null;
    if (action === 'edit' && recordId) {
        try {
            const res = await fetch(`${API_BASE}/${schemaType}s/`);
            const records = await res.json();
            const idField = `${schemaType}_id`;
            currentRec = records.find(r => r[idField] === recordId);
        } catch (err) {
            showAlert('Failed to load record details from backend.', 'error');
            closeAdminModal();
            return;
        }
    }

    // Build form dynamically
    if (schemaType === 'customer') {
        formContainer.innerHTML = `
            <div class="form-group">
                <label>Customer ID</label>
                <input type="number" id="field-id" class="form-control" value="${currentRec ? currentRec.customer_id : ''}" ${action === 'edit' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="field-name" class="form-control" value="${currentRec ? currentRec.full_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="field-email" class="form-control" value="${currentRec ? currentRec.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="field-phone" class="form-control" value="${currentRec ? currentRec.phone : ''}">
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" id="field-address" class="form-control" value="${currentRec ? currentRec.address : ''}">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="text" id="field-password" class="form-control" value="${currentRec ? currentRec.password : ''}" required>
            </div>
        `;
    } else if (schemaType === 'driver') {
        formContainer.innerHTML = `
            <div class="form-group">
                <label>Driver ID</label>
                <input type="number" id="field-id" class="form-control" value="${currentRec ? currentRec.driver_id : ''}" ${action === 'edit' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label>Driver Name</label>
                <input type="text" id="field-name" class="form-control" value="${currentRec ? currentRec.driver_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="field-email" class="form-control" value="${currentRec ? currentRec.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="field-phone" class="form-control" value="${currentRec ? currentRec.phone : ''}">
            </div>
            <div class="form-group">
                <label>License Number</label>
                <input type="text" id="field-license" class="form-control" value="${currentRec ? currentRec.license_number : ''}" required>
            </div>
            <div class="form-group">
                <label>Experience (Years)</label>
                <input type="number" id="field-experience" class="form-control" value="${currentRec ? currentRec.experience : ''}" min="0">
            </div>
            <div class="form-group">
                <label>Availability</label>
                <select id="field-availability">
                    <option value="Available" ${currentRec && currentRec.availability === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Busy" ${currentRec && currentRec.availability === 'Busy' ? 'selected' : ''}>Busy</option>
                    <option value="Offline" ${currentRec && currentRec.availability === 'Offline' ? 'selected' : ''}>Offline</option>
                </select>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="text" id="field-password" class="form-control" value="${currentRec ? currentRec.password : 'driver123'}">
            </div>
        `;
    } else if (schemaType === 'vehicle') {
        formContainer.innerHTML = `
            <div class="form-group">
                <label>Vehicle ID</label>
                <input type="number" id="field-id" class="form-control" value="${currentRec ? currentRec.vehicle_id : ''}" ${action === 'edit' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label>Driver Name</label>
                <input type="text" id="field-driver-name" class="form-control" value="${currentRec ? currentRec.driver_name : ''}" placeholder="Driver assigned to" required>
            </div>
            <div class="form-group">
                <label>Vehicle Type</label>
                <select id="field-type">
                    <option value="Sedan" ${currentRec && currentRec.vehicle_type === 'Sedan' ? 'selected' : ''}>Sedan</option>
                    <option value="Hatchback" ${currentRec && currentRec.vehicle_type === 'Hatchback' ? 'selected' : ''}>Hatchback</option>
                    <option value="SUV" ${currentRec && currentRec.vehicle_type === 'SUV' ? 'selected' : ''}>SUV</option>
                    <option value="Auto" ${currentRec && currentRec.vehicle_type === 'Auto' ? 'selected' : ''}>Auto</option>
                    <option value="Bike" ${currentRec && currentRec.vehicle_type === 'Bike' ? 'selected' : ''}>Bike</option>
                    <option value="Luxury" ${currentRec && currentRec.vehicle_type === 'Luxury' ? 'selected' : ''}>Luxury</option>
                </select>
            </div>
            <div class="form-group">
                <label>Vehicle Number</label>
                <input type="text" id="field-number" class="form-control" value="${currentRec ? currentRec.vehicle_number : ''}" required>
            </div>
            <div class="form-group">
                <label>Seating Capacity</label>
                <input type="number" id="field-capacity" class="form-control" value="${currentRec ? currentRec.seating_capacity : '4'}" required>
            </div>
            <div class="form-group">
                <label>Vehicle Model</label>
                <input type="text" id="field-model" class="form-control" value="${currentRec ? currentRec.model : ''}" required>
            </div>
        `;
    } else if (schemaType === 'booking') {
        formContainer.innerHTML = `
            <div class="form-group">
                <label>Booking ID</label>
                <input type="number" id="field-id" class="form-control" value="${currentRec ? currentRec.booking_id : ''}" ${action === 'edit' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="field-customer" class="form-control" value="${currentRec ? currentRec.customer_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Driver Name</label>
                <input type="text" id="field-driver" class="form-control" value="${currentRec ? currentRec.driver_name : ''}">
            </div>
            <div class="form-group">
                <label>Pickup Location</label>
                <input type="text" id="field-pickup" class="form-control" value="${currentRec ? currentRec.pickup_location : ''}" required>
            </div>
            <div class="form-group">
                <label>Drop Location</label>
                <input type="text" id="field-drop" class="form-control" value="${currentRec ? currentRec.drop_location : ''}" required>
            </div>
            <div class="form-group">
                <label>Booking Date</label>
                <input type="date" id="field-date" class="form-control" value="${currentRec ? currentRec.booking_date : ''}" required>
            </div>
            <div class="form-group">
                <label>Fare (Amount)</label>
                <input type="number" id="field-fare" class="form-control" value="${currentRec ? currentRec.fare : ''}" required>
            </div>
            <div class="form-group">
                <label>Ride Status</label>
                <select id="field-status">
                    <option value="Requested" ${currentRec && currentRec.ride_status === 'Requested' ? 'selected' : ''}>Requested</option>
                    <option value="Accepted" ${currentRec && currentRec.ride_status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="In Progress" ${currentRec && currentRec.ride_status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${currentRec && currentRec.ride_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${currentRec && currentRec.ride_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        `;
    } else if (schemaType === 'payment') {
        formContainer.innerHTML = `
            <div class="form-group">
                <label>Payment ID</label>
                <input type="number" id="field-id" class="form-control" value="${currentRec ? currentRec.payment_id : ''}" ${action === 'edit' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label>Booking ID Reference</label>
                <input type="number" id="field-booking" class="form-control" value="${currentRec ? currentRec.booking_id : ''}" required>
            </div>
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="field-customer" class="form-control" value="${currentRec ? currentRec.customer_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Amount Paid</label>
                <input type="number" id="field-amount" class="form-control" value="${currentRec ? currentRec.amount : ''}" required>
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select id="field-method">
                    <option value="UPI" ${currentRec && currentRec.payment_method === 'UPI' ? 'selected' : ''}>UPI</option>
                    <option value="Credit Card" ${currentRec && currentRec.payment_method === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Debit Card" ${currentRec && currentRec.payment_method === 'Debit Card' ? 'selected' : ''}>Debit Card</option>
                    <option value="Wallet" ${currentRec && currentRec.payment_method === 'Wallet' ? 'selected' : ''}>Wallet</option>
                    <option value="Cash" ${currentRec && currentRec.payment_method === 'Cash' ? 'selected' : ''}>Cash</option>
                </select>
            </div>
            <div class="form-group">
                <label>Payment Status</label>
                <select id="field-status">
                    <option value="Success" ${currentRec && currentRec.payment_status === 'Success' ? 'selected' : ''}>Success</option>
                    <option value="Pending" ${currentRec && currentRec.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Failed" ${currentRec && currentRec.payment_status === 'Failed' ? 'selected' : ''}>Failed</option>
                </select>
            </div>
            <div class="form-group">
                <label>Transaction ID</label>
                <input type="text" id="field-transaction" class="form-control" value="${currentRec ? currentRec.transaction_id : ''}">
            </div>
            <div class="form-group">
                <label>Payment Date</label>
                <input type="date" id="field-date" class="form-control" value="${currentRec ? currentRec.payment_date : ''}" required>
            </div>
        `;
    }
}

async function handleAdminCrudSubmit(event) {
    event.preventDefault();
    const type = document.getElementById('modal-schema-type').value;
    const action = document.getElementById('modal-action-type').value;
    const id = document.getElementById('modal-record-id').value;

    let data = {};
    let url = `${API_BASE}/${type}s/`;

    if (action === 'add') {
        url += 'add/';
    } else {
        url += `update/${id}/`;
    }

    if (type === 'customer') {
        data = {
            customer_id: parseInt(document.getElementById('field-id').value),
            full_name: document.getElementById('field-name').value.trim(),
            email: document.getElementById('field-email').value.trim(),
            phone: document.getElementById('field-phone').value.trim(),
            address: document.getElementById('field-address').value.trim(),
            password: document.getElementById('field-password').value
        };
    } else if (type === 'driver') {
        data = {
            driver_id: parseInt(document.getElementById('field-id').value),
            driver_name: document.getElementById('field-name').value.trim(),
            email: document.getElementById('field-email').value.trim(),
            phone: document.getElementById('field-phone').value.trim(),
            license_number: document.getElementById('field-license').value.trim(),
            experience: parseInt(document.getElementById('field-experience').value) || 0,
            availability: document.getElementById('field-availability').value,
            password: document.getElementById('field-password').value
        };
    } else if (type === 'vehicle') {
        data = {
            vehicle_id: parseInt(document.getElementById('field-id').value),
            driver_name: document.getElementById('field-driver-name').value.trim(),
            vehicle_type: document.getElementById('field-type').value,
            vehicle_number: document.getElementById('field-number').value.trim(),
            seating_capacity: parseInt(document.getElementById('field-capacity').value),
            model: document.getElementById('field-model').value.trim()
        };
    } else if (type === 'booking') {
        data = {
            booking_id: parseInt(document.getElementById('field-id').value),
            customer_name: document.getElementById('field-customer').value.trim(),
            driver_name: document.getElementById('field-driver').value.trim(),
            pickup_location: document.getElementById('field-pickup').value.trim(),
            drop_location: document.getElementById('field-drop').value.trim(),
            booking_date: document.getElementById('field-date').value,
            fare: parseFloat(document.getElementById('field-fare').value),
            ride_status: document.getElementById('field-status').value
        };
    } else if (type === 'payment') {
        data = {
            payment_id: parseInt(document.getElementById('field-id').value),
            booking_id: parseInt(document.getElementById('field-booking').value),
            customer_name: document.getElementById('field-customer').value.trim(),
            amount: parseFloat(document.getElementById('field-amount').value),
            payment_method: document.getElementById('field-method').value,
            payment_status: document.getElementById('field-status').value,
            transaction_id: document.getElementById('field-transaction').value.trim(),
            payment_date: document.getElementById('field-date').value
        };
    }

    try {
        const response = await fetch(url, {
            method: action === 'add' ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert(`Record ${action === 'add' ? 'added' : 'updated'} successfully!`);
            closeAdminModal();
            loadAdminTabData(currentAdminTab);
        } else {
            const resData = await response.json();
            showAlert(resData.error || 'Failed to execute operation.', 'error');
        }
    } catch (err) {
        showAlert('Network error saving details.', 'error');
    }
}

async function deleteAdminRecord(endpointName, id) {
    if (!confirm(`Are you sure you want to delete this record?`)) return;

    try {
        const response = await fetch(`${API_BASE}/${endpointName}/delete/${id}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Record deleted successfully.');
            loadAdminTabData(currentAdminTab);
        } else {
            showAlert('Failed to delete record.', 'error');
        }
    } catch (err) {
        showAlert('Network error during deletion.', 'error');
    }
}
