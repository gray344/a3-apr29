<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salesman Dashboard</title>
  <!-- CSS Includes -->
  <link rel="stylesheet" href="//code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="dashboard.css">
  <!-- JS Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
  <!-- Font Awesome (Example - Add if icons like fa-edit are used) -->
  <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"> -->

</head>

<div class="logout-container">
  <button onclick="window.location.href='logout.php'" class="logout-btn">Log Out</button>
</div>

<body>
  <header><h1>SALESMAN DASHBOARD</h1></header>
  <div class="horizon-picker" id="time-horizon-picker">
    <button data-horizon="1M">1M</button>
    <button data-horizon="3M">3M</button>
    <button data-horizon="6M" class="active">6M</button> <!-- Default active -->
    <button data-horizon="1Y">1Y</button>
    <button data-horizon="ALL">MAX</button>
  </div>
  <div class="container">
    <div class="left-column">
      <!-- Create New Card -->
      <div class="card">
        <div class="card-header">Create New</div>
        <div class="card-body">
          <!-- The form structure remains the same -->
          <form id="createForm" method="POST" action="salesman_create_instance.php">
            <select name="action_type" id="action_type"> <!-- Removed onchange -->
              <option value="indiv_customer">Individual Customer</option>
              <option value="company_customer">Company Customer</option>
              <option value="order">Order</option>
              <option value="pickup">Pickup Request</option>
            </select>
            <!-- Field divs remain the same -->
            <div id="indivCustomerFields">
              <label for="cust_fname">First Name</label>
              <input type="text" name="cust_fname" id="cust_fname">
              <label for="cust_lname">Last Name</label>
              <input type="text" name="cust_lname" id="cust_lname">
              <label for="cust_email">Email</label>
              <input type="email" name="cust_email" id="cust_email">
              <label for="cust_address">Address</label>
              <input type="text" name="cust_address" id="cust_address">
            </div>
            <div id="companyCustomerFields" style="display:none;">
              <label for="comp_fname">Contact First Name</label>
              <input type="text" name="comp_fname" id="comp_fname">
              <label for="comp_lname">Contact Last Name</label>
              <input type="text" name="comp_lname" id="comp_lname">
              <label for="comp_email">Contact Email</label>
              <input type="email" name="comp_email" id="comp_email">
              <label for="comp_address">Contact Address</label>
              <input type="text" name="comp_address" id="comp_address">
              <label for="company_name">Company Name</label>
              <input type="text" name="company_name" id="company_name">
              <label for="tax_id">Tax ID</label>
              <input type="text" name="tax_id" id="tax_id">
            </div>
            <div id="orderFields" style="display:none;">
              <label for="order_cust_id">Customer ID</label>
              <input type="text" name="order_cust_id" id="order_cust_id">
               <table>
                <thead>
                  <tr>
                    <th>ITEM</th> <!-- Simplified Header -->
                    <th>QUANTITY</th>
                    <th>SUBTOTAL</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody id="orderItems">
                  <!-- Initial row structure remains -->
                  <tr>
                    <td>
                      <input type="text" name="item_search[]" class="item-search" placeholder="Search item...">
                      <input type="hidden" name="item_id[]" class="item-id">
                      <span class="item-name"></span> <!-- Item details shown here -->
                    </td>
                    <td><input type="number" name="quantity[]" class="quantity" min="1" value="1"></td> <!-- Removed inline oninput -->
                    <td class="subtotal">$0.00</td>
                    <td><button type="button" class="removeRow btn btn-danger btn-sm">Remove</button></td> <!-- Added btn classes -->
                  </tr>
                </tbody>
              </table>
              <button type="button" id="addMoreItems" class="btn btn-secondary btn-sm">+ Add Item</button> <!-- Added btn classes -->
              <div class="total-section">
                <strong>TOTAL: </strong><span id="orderTotal">$0.00</span>
              </div>
            </div>
            <div id="pickupFields" style="display:none;">
              <label for="pickup_order_id">Order ID</label>
              <input type="text" name="pickup_order_id" id="pickup_order_id">
              <label for="pickup_date">Pickup Date</label>
              <input type="date" name="pickup_date" id="pickup_date">
              <label for="scheduled_by">Employee Responsible</label>
              <input type="text" name="scheduled_by" id="scheduled_by">
            </div>
            <button type="submit" class="btn btn-primary">Create</button> <!-- Added btn class -->
          </form>
        </div>
      </div>

      <!-- Find/Edit Customer Card -->
      <div class="card">
         <div class="card-header d-flex justify-content-between align-items-center">
            <span>Find Customer</span>
            <!-- Edit button moved inside form, controlled by JS -->
        </div>
        <div class="card-body">
            <div class="search-section mb-3">
                <div class="input-group">
                    <input type="text" id="searchCustomer" class="form-control" placeholder="Search by ID, name, email, company name, or tax ID">
                    <div class="input-group-append">
                        <!-- Removed inline onclick -->
                        <button id="searchCustomerBn" class="btn btn-primary">Search</button>
                    </div>
                </div>
            </div>

            <!-- Customer Info/Edit Form -->
            <div id="customerInfo" class="customer-details mb-3" style="display: none;">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Customer Details</h5>
                        <!-- Form now handles both display and edit -->
                        <form id="customerForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>ID:</strong> <span id="customerId"></span></p>
                                    <p><strong>Type:</strong> <span id="customerType"></span></p>
                                    <div class="form-group">
                                        <label><strong>Name:</strong></label>
                                        <!-- Name split handled in JS during update -->
                                        <input type="text" class="form-control customer-field" id="customerName" name="full_name" disabled>
                                    </div>
                                    <div class="form-group">
                                        <label><strong>Email:</strong></label>
                                        <input type="email" class="form-control customer-field" id="customerEmail" name="email" disabled>
                                    </div>
                                     <div class="form-group">
                                        <label><strong>Phone:</strong></label>
                                        <input type="tel" class="form-control customer-field" id="customerPhone" name="phone_number" disabled>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label><strong>Street Address:</strong></label>
                                        <input type="text" class="form-control customer-field" id="customerStreet" name="street_address" disabled>
                                    </div>
                                    <div class="form-row">
                                        <div class="col">
                                            <label><strong>City:</strong></label>
                                            <input type="text" class="form-control customer-field" id="customerCity" name="city" disabled>
                                        </div>
                                        <div class="col">
                                            <label><strong>State:</strong></label>
                                            <select class="form-control customer-field" id="customerState" name="state" disabled>
                                                <!-- States populated via JS -->
                                            </select>
                                        </div>
                                        <div class="col">
                                            <label><strong>ZIP:</strong></label>
                                            <input type="text" class="form-control customer-field" id="customerZip" name="zip_code" disabled>
                                        </div>
                                    </div>
                                    <!-- Company details shown/hidden by JS -->
                                    <div id="companyDetails" style="display: none;">
                                        <div class="form-group">
                                            <label><strong>Company:</strong></label>
                                            <input type="text" class="form-control customer-field" id="companyName" name="company_name" disabled>
                                        </div>
                                        <div class="form-group">
                                            <label><strong>Tax ID:</strong></label>
                                            <input type="text" class="form-control customer-field" id="taxId" name="tax_id" disabled>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Action Buttons -->
                            <div class="text-right mt-3">
                                <!-- Edit button shown initially -->
                                <button type="button" id="editCustomerBtn" class="btn btn-secondary">
                                    <i class="fas fa-edit"></i> Edit Customer
                                </button>
                                <!-- Save/Cancel shown when editing -->
                                <div id="saveSection" style="display: none;">
                                    <button type="button" id="cancelEditBtn" class="btn btn-secondary">Cancel</button>
                                    <button type="submit" id="saveCustomerBtn" class="btn btn-success">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Customer Value Section -->
            <div id="customerValue" class="mb-3" style="display: none;">
              <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Customer Lifetime Value</h5>
                        <h3 class="text-primary" id="totalValue">$0.00</h3>
                        <small class="text-muted">Past 6 months total revenue</small>
                    </div>
                </div>
            </div>

            <!-- Orders Section -->
            <div id="ordersSection" style="display: none;">
              <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Recent Orders</h5>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Complaints</th>
                                    </tr>
                                </thead>
                                <tbody id="ordersList">
                                    <!-- Orders will be populated via JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lifetime Chart Section -->
            <div class="chart-section">
                <div id="lifetimeContainer" style="display:none;">
                  <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Revenue Over Time</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> <!-- End Find/Edit Customer Card -->


      <!-- Find Order Card -->
      <div class="card">
        <div class="card-header">Find Order or Pickup</div>
        <div class="card-body">
          <input type="text" id="searchOrder" placeholder="Enter order ID">
          <!-- Removed inline onclick -->
          <button class="btn btn-primary">Search</button>
          <div id="orderInfo"></div>
        </div>
      </div>

      <!-- Edit Customer (Older Form - Keep or Remove?) -->
      <div class="card">
        <div class="card-header">Edit Customer (Legacy)</div>
        <div class="card-body">
          <input type="text" id="editCustId" placeholder="Enter Customer ID">
          <!-- Removed inline onclick -->
          <button class="btn btn-secondary">Load</button>

          <!-- Removed inline onsubmit -->
          <form id="editCustomerForm" style="display:none;">
            <input type="hidden" name="action_type" value="update_customer">
            <input type="hidden" id="edit_cust_id" name="cust_id">
            <label>First Name <input type="text" id="edit_fname" name="cust_fname"></label>
            <label>Last Name  <input type="text" id="edit_lname" name="cust_lname"></label>
            <label>Email      <input type="email" id="edit_email" name="cust_email"></label>
            <label>Address    <input type="text" id="edit_address" name="cust_address"></label>
            <button type="submit" class="btn btn-success">Save Changes</button>
          </form>
        </div>
      </div>

      <!-- Edit Pickup (Older Form - Keep or Remove?) -->
      <div class="card">
        <div class="card-header">Edit Pickup (Legacy)</div>
        <div class="card-body">
          <input type="text" id="editPickupId" placeholder="Enter Pickup ID">
          <!-- Removed inline onclick -->
          <button class="btn btn-secondary">Load</button>

          <!-- Removed inline onsubmit -->
          <form id="editPickupForm" style="display:none;">
            <input type="hidden" name="action_type" value="update_pickup">
            <input type="hidden" id="edit_pickup_id" name="pickup_id">
            <label>Date   <input type="date" id="edit_pickup_date" name="pickup_date"></label>
            <label>Status
              <select id="edit_pickup_status" name="status">
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </label>
            <button type="submit" class="btn btn-success">Save Changes</button>
          </form>
        </div>
      </div>
    </div> <!-- End left-column -->

    <div class="right-column">
      <!-- Complaints Card -->
      <div class="card" style="height:100%;">
        <div class="card-header">Complaints</div>
        <div class="card-body">
          <div id="complaintsList">Loading complaints...</div>
        </div>
      </div>
    </div> <!-- End right-column -->
  </div> <!-- End container -->

<!-- Application Scripts -->
<script src="salesman_functions.js"></script>
<script src="salesman_charts.js"></script>

<button onclick="topFunction()" id="myBtn" title="Go to top">Top</button>

<script>
// Scroll-to-top Button Logic
let mybutton = document.getElementById("myBtn");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.classList.add('show');
  } else {
    mybutton.classList.remove('show');
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
</script>

<script>
  // Initialize the dashboard once the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check if initializeDashboard is defined before calling
    if (typeof initializeDashboard === 'function') {
      initializeDashboard(); // Call the main initialization function
    } else {
      console.error('Initialization function (initializeDashboard) not found.');
      alert('Error initializing page scripts. Please check the console.');
    }
  });
</script>
</body>
</html>
