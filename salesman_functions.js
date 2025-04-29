// Global variable for the currently displayed customer data
let currentCustomer = null;
// Global variable for the current time horizon
let currentHorizon = '6M'; // Default horizon

// Utility to handle high-DPR screens
function fixCanvasResolution(canvas) {
  const dpr = window.devicePixelRatio || 1, r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  canvas.getContext('2d').scale(dpr, dpr);
}

// Nicely format table headers
function formatHeader(h) {
  return h.replace(/_/g,' ')
          .replace(/([A-Z])/g,' $1')
          .replace(/^./, s => s.toUpperCase())
          .trim();
}

// Generic data fetcher (uses currentHorizon)
function fetchData(type, callback, horizon = currentHorizon) { // Use global horizon by default
  const el = document.getElementById(type);
  if (!el) return console.warn(`Element with ID '${type}' not found for fetchData.`); // Warn instead of silent return
  el.innerHTML = '<div class="loading">Loading data...</div>';

  const url = `../includes/data.php?type=${type}`
            + `&horizon=${horizon}` // Use the passed or global horizon
            + `&_=${Date.now()}`;
  console.log('FETCH (Generic):', url);

  fetch(url)
    .then(r => r.ok
      ? r.json()
      : r.json().then(e => { throw new Error(e.error || `HTTP ${r.status}`); })
    )
    .then(data => {
        // Check if the callback is actually for a chart type expected by salesman_charts.js
        if (typeof window[callback] === 'function') {
             window[callback](type, data); // Call function by name if global
        } else if (typeof callback === 'function') {
             callback(type, data); // Otherwise, assume it's a direct function reference
        } else {
             console.error(`Callback '${callback}' is not a function for type '${type}'`);
             renderTable(type, data); // Fallback to renderTable if callback is invalid/missing
        }
    })
    .catch(err => {
      el.innerHTML = `<div class="error">Error loading ${type}: ${err.message}</div>`;
      console.error(`Error fetching ${type}:`, err);
    });
}

// Customer search functionality (using customer_api.php)
async function fetchCustomer() {
  const searchTerm = document.getElementById('searchCustomer').value.trim();
  if (!searchTerm) {
      showError('Please enter a search term');
      return;
  }
  
  try {
      showLoading();
      console.log("Fetching from URL:", `customer_api.php?action=search&term=${encodeURIComponent(searchTerm)}`);
      
      const response = await fetch(`customer_api.php?action=search&term=${encodeURIComponent(searchTerm)}`);
      console.log("Response status:", response.status);
      
      // Get the raw text first to debug any issues
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Try to parse as JSON
      const data = JSON.parse(responseText);
      console.log("Parsed data:", data);
      
      if (data.success) {
          currentCustomer = data.data;
          displayCustomerInfo(data.data);
          cancelEdit();
          loadOrders(data.data.PersonID);
      } else {
          showError(data.error || 'Customer not found');
          // Clear previous results
          document.getElementById('customerInfo').style.display = 'none';
          document.getElementById('ordersSection').style.display = 'none';
          document.getElementById('customerValue').style.display = 'none';
          document.getElementById('lifetimeContainer').style.display = 'none';
          document.getElementById('editCustomerBtn').style.display = 'none';
      }
  } catch (error) {
      showError('Error fetching customer data: ' + error.message);
      console.error(error);
      
      // Clear results on error as well
      document.getElementById('customerInfo').style.display = 'none';
      document.getElementById('ordersSection').style.display = 'none';
      document.getElementById('customerValue').style.display = 'none';
      document.getElementById('lifetimeContainer').style.display = 'none';
      document.getElementById('editCustomerBtn').style.display = 'none';
  } finally {
      hideLoading();
  }
}

function displayCustomerInfo(customer) {
    // Show customer info section and edit button
    document.getElementById('customerInfo').style.display = 'block';
    document.getElementById('editCustomerBtn').style.display = 'block';

    // Basic info
    document.getElementById('customerId').textContent = customer.PersonID;
    document.getElementById('customerType').textContent = customer.CustomerType;
    document.getElementById('customerName').value = customer.FullName;
    document.getElementById('customerEmail').value = customer.Email;
    document.getElementById('customerPhone').value = customer.PhoneNumber;
    
    // Address fields
    document.getElementById('customerStreet').value = customer.StreetAddress;
    document.getElementById('customerCity').value = customer.City;
    document.getElementById('customerState').value = customer.State;
    document.getElementById('customerZip').value = customer.ZipCode;

    // Company specific info
    const companyDetails = document.getElementById('companyDetails');
    if (customer.CustomerType === 'Company') {
        companyDetails.style.display = 'block';
        document.getElementById('companyName').value = customer.CompanyName;
        document.getElementById('taxId').value = customer.TaxID;
    } else {
        companyDetails.style.display = 'none';
    }
    // Ensure fields are disabled initially
}

async function loadOrders(personId) {
  
    try {
        const response = await fetch(`customer_api.php?action=orders&person_id=${personId}`);
        const data = await response.json();

        if (data.success) {
            displayOrders(data.data.orders);
            // Assuming updateChart is defined in salesman_charts.js
            if (typeof updateChart === 'function') {
                updateChart(data.data.orders);
            }
            calculateLifetimeValue(data.data.orders);
        }
    } catch (error) {
        showError('Error loading orders');
        console.error(error);
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="5">No orders found for this customer.</td></tr>';
        document.getElementById('ordersSection').style.display = 'block';
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        // Add complaint class if applicable
        if (order.ComplaintStatus && order.ComplaintStatus !== 'None' && order.ComplaintStatus !== 'Resolved') {
            row.classList.add('complaint-row'); // You'll need to define .complaint-row in dashboard.css
        }
        row.innerHTML = `
            <td>${order.OrderID}</td>
            <td>${formatDate(order.OrderDate)}</td>
            <td>$${parseFloat(order.Total).toFixed(2)}</td>
            <td><span class="status ${getStatusClass(order.Status)}">${order.Status}</span></td>
            <td><span class="status ${getComplaintClass(order.ComplaintStatus)}">${order.ComplaintStatus || 'None'}</span></td>
        `;
        ordersList.appendChild(row);
    });

    document.getElementById('ordersSection').style.display = 'block';
}

function calculateLifetimeValue(orders) {
    // Filter orders within the last 6 months (or based on horizon? Needs clarification)
    // For now, summing all provided orders
    const total = orders.reduce((sum, order) => sum + parseFloat(order.Total), 0);
    document.getElementById('totalValue').textContent = `$${total.toFixed(2)}`;
    document.getElementById('customerValue').style.display = 'block';
}

// Order search functionality (using api.php - consider unifying API endpoints)
function fetchOrder() {
  const id = document.getElementById('searchOrder').value;
  if (!id) {
    alert("Please enter an order ID");
    return;
  }
 
  document.getElementById('orderInfo').innerHTML = '<p>Loading order data...</p>';
 
  // TODO: Unify API endpoint? Using api.php for now.
  fetch(`customer_api.php?action=getOrder&order_id=${encodeURIComponent(id)}`)
    .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e.error || `HTTP ${res.status}`))) 
    .then(o => {
      if (!o || Object.keys(o).length === 0) {
        document.getElementById('orderInfo').innerHTML = '<p>No order found with that ID.</p>';
        return;
      }
     
      let html = `<h3>Order ${o.id}</h3>`;
      if (o.customer) {
        html += `<p>Customer: ${o.customer.name} (ID: ${o.customer.id})</p>`;
      }
      html += `<p>Total: $${o.total.toFixed(2)}</p>`;
      // Add color coding for paid/unpaid status
      html += `<p>Status: ${o.paid ? '<span class="status status-paid">Paid</span>' : '<span class="status status-unpaid">Unpaid</span>'}</p>`;
      if (o.pickup) html += `<p>Pickup: ${o.pickup.date} (Status: ${o.pickup.status})</p>`;
      // Add color coding for complaint status
      if (o.complaint) html += `<p class="status ${getComplaintClass(o.complaint.status)}">Complaint: ${o.complaint.text}</p>`;
     
      document.getElementById('orderInfo').innerHTML = html;
    })
    .catch(error => {
      console.error('Error fetching order:', error);
      document.getElementById('orderInfo').innerHTML = '<p>Error loading order data. Please try again.</p>';
    });
}

// Complaints functionality
function loadComplaints() {
  const url = `../includes/data.php?type=list-complaints&_=${Date.now()}`;
  fetch(url)
    .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
    .then(list => {
      const container = document.getElementById('complaintsList');
      if (!list || list.length === 0) {
        return container.innerHTML = '<p>No complaints found.</p>';
      }
      let html = '<div class="table-responsive"><table class="table"><thead><tr><th>ID</th><th>Customer</th><th>Order</th><th>Text</th><th>Status</th><th>Resolution</th><th>Action</th></tr></thead><tbody>';
      list.forEach(c => {
        const rowClass = getComplaintClass(c.status); // Get class based on status
        html += `<tr class="${rowClass}">
          <td>${c.id}</td>
          <td>${c.customer_id}</td>
          <td>${c.order_id}</td>
          <td>${c.text}</td>
          <td>${c.status}</td>
          <td><textarea id="res_${c.id}" rows="2" style="width:95%;">${c.resolution || ''}</textarea></td>
          <td>
            <button type="button" onclick="updateComplaint(${c.id})">Save</button>
          </td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    })
    .catch(err => {
      console.error('Error loading complaints:', err);
      document.getElementById('complaintsList')
              .innerHTML = '<p>Error loading complaints. Please try again.</p>';
    });
}

async function updateComplaint(id) {
  // 1. Grab the resolution text
  const resText = document.getElementById(`res_${id}`).value.trim();
  console.log('updateComplaint called, id=', id, 'text=', resText);

  // 2. Build the URL (adjust path if needed!)
  const url = `customer_api.php?action=update_complaint`;
  console.log('Fetching:', url);

  try {
    // 3. Fire the request
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaint_id: id, resolution: resText })
    });

    // 4. Log HTTP status
    console.log(`HTTP status: ${response.status} ${response.statusText}`);

    // 5. Read raw text
    const text = await response.text();
    console.log('Raw response text:', text);

    // 6. Try parsing JSON
    let payload;
    try {
      payload = JSON.parse(text);
      console.log('Parsed JSON:', payload);
    } catch (parseErr) {
      console.error('❌ JSON parse error:', parseErr);
      throw new Error('Invalid JSON in response');
    }

    // 7. Handle your success / error envelope
    if (payload.success) {
      alert('✅ Complaint updated!');
      loadComplaints();
    } else {
      alert('❌ Update failed: ' + payload.error);
    }

  } catch (err) {
    // 8. Anything thrown above lands here
    console.error('❌ Network or server error:', err);
    alert('❌ Network or server error: ' + err.message);
  }
}

async function handleCustomerUpdate() {
    if (!currentCustomer) return showError('No customer data loaded to update.');

    // Create FormData from the form
    const formElement = document.getElementById('customerForm');
    const formData = new FormData(formElement);

    // Manually add fields that might be needed by the API but aren't direct inputs
    formData.append('person_id', currentCustomer.PersonID);
    formData.append('customer_type', currentCustomer.CustomerType); // Send type back

    // Add company details if applicable
    if (currentCustomer.CustomerType === 'Company') {
        formData.append('company_name', document.getElementById('companyName').value);
        formData.append('tax_id', document.getElementById('taxId').value);
    }
    
    // Add full name (split from the single input) - Assuming API expects separate names
    const fullName = document.getElementById('customerName').value.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ') || '';
    formData.append('first_name', firstName); // Adjust API expectation if needed
    formData.append('last_name', lastName);   // Adjust API expectation if needed
    formData.append('email', document.getElementById('customerEmail').value);
    formData.append('phone_number', document.getElementById('customerPhone').value);
    formData.append('street_address', document.getElementById('customerStreet').value);
    formData.append('city', document.getElementById('customerCity').value);
    formData.append('state', document.getElementById('customerState').value);
    formData.append('zip_code', document.getElementById('customerZip').value);


    try {
        showLoading();
        // Use POST with FormData for customer_api.php update action
        const response = await fetch('customer_api.php?action=update', {
            method: 'POST',
            body: formData // Send FormData directly
        });
        const data = await response.json();

        if (data.success) {
            showSuccess('Customer information updated successfully');
            // Update local currentCustomer with the potentially modified data returned
            // Assuming the API returns the updated customer object in data.data
            currentCustomer = data.data || currentCustomer; // Fallback to old data if API doesn't return updated
            cancelEdit(); // Reset form to view mode with updated data
            displayCustomerInfo(currentCustomer); // Explicitly refresh display
        } else {
            showError(data.error || 'Error updating customer');
        }
    } catch (error) {
        showError('Network or server error updating customer');
        console.error('Update Customer Error:', error);
    } finally {
        hideLoading();
    }
}

// Add this function to your salesman_functions.js file
function cancelEdit() {
  // Hide all editable elements
  const editableElements = document.querySelectorAll('.customer-info-editable');
  editableElements.forEach(el => {
      el.style.display = 'none';
  });
  
  // Show all read-only elements
  const readOnlyElements = document.querySelectorAll('.customer-info-readonly');
  readOnlyElements.forEach(el => {
      el.style.display = 'block';
  });
  
  // Hide the save button
  document.getElementById('saveCustomerBtn').style.display = 'none';
  
  // Reset form values to match the current customer data
  if (currentCustomer) {
    document.getElementById('customerName').value = `${currentCustomer.FirstName || ''} ${currentCustomer.LastName || ''}`.trim();
    document.getElementById('customerEmail').value = currentCustomer.Email || '';
    document.getElementById('customerPhone').value = currentCustomer.Phone || '';
    document.getElementById('customerStreet').value = currentCustomer.StreetAddress || '';
    document.getElementById('customerCity').value = currentCustomer.City || '';
    document.getElementById('customerState').value = currentCustomer.State || '';
    document.getElementById('customerZip').value = currentCustomer.ZipCode || '';    
  }
}

function enableCustomerEdit() {
  const fields = document.querySelectorAll('.customer-field');
  fields.forEach(field => field.disabled = false);

  // Show the save/cancel buttons
  document.getElementById('saveSection').style.display = 'block';
}


// --- Edit Customer/Pickup (Older Forms - Keep or Remove?) ---
// Assuming these are still needed for now.
function loadCustomerForEdit() {
  const custId = document.getElementById('editCustId').value;
  if (!custId) return alert('Please enter a Customer ID');
  // Fetch customer data (similar to fetchCustomer but maybe simpler endpoint?)
  // For now, assuming fetchCustomer sets currentCustomer
  fetchCustomer().then(() => {
      if (currentCustomer && currentCustomer.PersonID == custId) {
          document.getElementById('edit_cust_id').value = currentCustomer.PersonID;
          document.getElementById('edit_fname').value = currentCustomer.FirstName; // Assuming FirstName, LastName exist
          document.getElementById('edit_lname').value = currentCustomer.LastName;
          document.getElementById('edit_email').value = currentCustomer.Email;
          document.getElementById('edit_address').value = currentCustomer.StreetAddress; // Assuming StreetAddress
          document.getElementById('editCustomerForm').style.display = 'block';
      } else {
          alert('Customer not found or ID mismatch.');
      }
  });
}

function submitCustomerEdit() {
  const form = document.getElementById('editCustomerForm');
  const formData = new FormData(form);
  fetch('salesman_create_instance.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Customer updated successfully!');
        form.style.display = 'none';
      } else {
        alert('Error updating customer: ' + data.error);
      }
    })
    .catch(err => alert('Network error updating customer.'));
  return false; // Prevent default form submission
}

function loadPickupForEdit() {
  const pickupId = document.getElementById('editPickupId').value;
  if (!pickupId) return alert('Please enter a Pickup ID');
  // Fetch pickup data - requires a new API endpoint
  fetch(`../includes/data.php?type=get-pickup&id=${pickupId}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.id) {
        document.getElementById('edit_pickup_id').value = data.id;
        document.getElementById('edit_pickup_date').value = data.date; // Assuming date format is YYYY-MM-DD
        document.getElementById('edit_pickup_status').value = data.status;
        document.getElementById('editPickupForm').style.display = 'block';
      } else {
        alert('Pickup not found.');
      }
    })
    .catch(err => alert('Error loading pickup data.'));
}

function submitPickupEdit() {
  const form = document.getElementById('editPickupForm');
  const formData = new FormData(form);
  fetch('salesman_create_instance.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Pickup updated successfully!');
        form.style.display = 'none';
      } else {
        alert('Error updating pickup: ' + data.error);
      }
    })
    .catch(err => alert('Network error updating pickup.'));
  return false; // Prevent default form submission
}

// --- Create New Form ---
function toggleCreateFields() {
  var action = document.getElementById('action_type').value;
  var indivFields = document.getElementById('indivCustomerFields');
  var compFields = document.getElementById('companyCustomerFields');
  var orderFields = document.getElementById('orderFields');
  var pickupFields = document.getElementById('pickupFields');

  // Hide all initially
  indivFields.style.display = 'none';
  compFields.style.display = 'none';
  orderFields.style.display = 'none';
  pickupFields.style.display = 'none';

  // Remove required attribute from all potentially affected inputs
  const allInputs = document.querySelectorAll('#createForm input, #createForm select, #createForm textarea');
  allInputs.forEach(input => input.required = false);


  // Show relevant section and set required fields
  if (action === 'indiv_customer') {
    indivFields.style.display = '';
    document.getElementById('cust_fname').required = true;
    document.getElementById('cust_lname').required = true;
    document.getElementById('cust_email').required = true;
    document.getElementById('cust_address').required = true;
  } else if (action === 'company_customer') {
    compFields.style.display = '';
    document.getElementById('comp_fname').required = true;
    document.getElementById('comp_lname').required = true;
    document.getElementById('comp_email').required = true;
    document.getElementById('comp_address').required = true;
    document.getElementById('company_name').required = true;
    document.getElementById('tax_id').required = true;
  } else if (action === 'order') {
    orderFields.style.display = '';
    document.getElementById('order_cust_id').required = true;
    // Add required for at least one item? Maybe handled by form validation logic later.
  } else if (action === 'pickup') {
    pickupFields.style.display = '';
    document.getElementById('pickup_order_id').required = true;
    document.getElementById('pickup_date').required = true;
    document.getElementById('scheduled_by').required = true; // Make employee required
  }
}

// --- Create Order Items ---
function initializeItemAutocomplete(element) {
    if (typeof $ === 'undefined' || typeof $.ui === 'undefined') {
        console.error("jQuery or jQuery UI not loaded. Autocomplete cannot be initialized.");
        return;
    }
    $(element).autocomplete({
        source: "../includes/get_items.php", // Ensure this path is correct
        minLength: 2,
        select: function(event, ui) {
            const row = $(this).closest('tr');
            row.find('.item-id').val(ui.item.id); // Set hidden item ID
            row.find('.item-name').html(`<small>${ui.item.label} (Stock: ${ui.item.stock})</small>`); // Display selected item name/info
            row.find('.quantity').attr('max', ui.item.stock).trigger('input'); // Set max quantity and trigger update
            
            // Store price on the row (e.g., data attribute) for subtotal calculation
            row.data('price', ui.item.price); 
            updateOrderRowSubtotal(row.get(0)); // Update subtotal for this row

            $(this).val(''); // Clear the search input after selection
            return false; // Prevent the value from being inserted into the input field
        }
    }).autocomplete("instance")._renderItem = function(ul, item) {
        // Customize how items are displayed in the dropdown
        return $("<li>")
            .append(`<div><strong>#${item.id}</strong> ${item.label}<br><small>${item.brand} | ${item.category} | Price: $${item.price.toFixed(2)} | Stock: ${item.stock}</small></div>`)
            .appendTo(ul);
    };
}

function addOrderRow() {
    const tbody = document.getElementById('orderItems');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <input type="text" name="item_search[]" class="item-search" placeholder="Search item...">
            <input type="hidden" name="item_id[]" class="item-id">
            <span class="item-name"></span>
        </td>
        <td>
            <input type="number" name="quantity[]" class="quantity" min="1" value="1" oninput="updateOrderRowSubtotal(this.closest('tr'))">
        </td>
        <td class="subtotal">$0.00</td>
        <td>
            <button type="button" class="removeRow btn btn-danger btn-sm" onclick="removeOrderRow(this)">Remove</button>
        </td>
    `;
    tbody.appendChild(newRow);
    initializeItemAutocomplete(newRow.querySelector('.item-search')); // Init autocomplete for the new row
    updateOrderTotal(); // Recalculate total
}

function removeOrderRow(button) {
    button.closest('tr').remove();
    updateOrderTotal(); // Recalculate total
}

function updateOrderRowSubtotal(rowElement) {
    const row = $(rowElement); // Use jQuery to easily access data()
    const price = parseFloat(row.data('price')) || 0;
    const quantityInput = row.find('.quantity');
    const quantity = parseInt(quantityInput.val()) || 0;
    const maxStock = parseInt(quantityInput.attr('max')) || Infinity;

    // Clamp quantity to stock if needed
    const clampedQuantity = Math.max(1, Math.min(quantity, maxStock));
     if (quantity !== clampedQuantity) {
        quantityInput.val(clampedQuantity); // Update input if clamped
     }

    const subtotal = price * clampedQuantity;
    row.find('.subtotal').text('$' + subtotal.toFixed(2));
    updateOrderTotal(); // Update the grand total whenever a subtotal changes
}


function updateOrderTotal() {
    let total = 0;
    document.querySelectorAll('#orderItems tr').forEach(row => {
        const subtotalText = row.querySelector('.subtotal').textContent;
        const subtotal = parseFloat(subtotalText.replace('$', '')) || 0;
        total += subtotal;
    });
    document.getElementById('orderTotal').textContent = '$' + total.toFixed(2);
}


// TABLE RENDERER (Generic)
function renderTable(type, data) {
  const c = document.getElementById(type);
  if (!c) return;
  if (!data || !data.length) {
    return void (c.innerHTML = '<div class="no-data">No data available</div>');
  }

  const cols = Object.keys(data[0]);
  let html = '<div class="table-responsive"><table class="table"><thead><tr>' + cols.map(col=>`<th>${formatHeader(col)}</th>`).join('') + '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>' + cols.map(col => {
      const val = row[col];
      if (/price|revenue|amount|total/i.test(col)) return `<td>$${(+val).toFixed(2)}</td>`;
      if (/date/i.test(col)) return `<td>${val ? formatDate(val) : ''}</td>`;
      return `<td>${val === null || val === undefined ? '' : val}</td>`;
    }).join('') + '</tr>';
  });
  c.innerHTML = html + '</tbody></table></div>';
}

// Utility functions for UI feedback
function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
}

function getStatusClass(status) {
    const statusClasses = {
        'Pending': 'status-pending',
        'Processing': 'status-processing',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled',
        'Paid': 'status-paid',
        'Unpaid': 'status-unpaid'
    };
    return statusClasses[status] || 'status-secondary'; // Define these in dashboard.css
}

function getComplaintClass(status) {
    const complaintClasses = {
        'None': 'complaint-none',
        'Pending': 'complaint-pending',
        'Resolved': 'complaint-resolved',
        'Escalated': 'complaint-escalated'
    };
    return complaintClasses[status] || 'complaint-none'; // Define these in dashboard.css
}

function showLoading() {
    document.body.style.cursor = 'wait';
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

function showError(message) {
    alert('Error: ' + message); // Replace with a better UI element
}

function showSuccess(message) {
    alert('Success: ' + message); // Replace with a better UI element
}

// Function to populate state dropdown
function populateStateDropdown() {
    const stateSelect = document.getElementById('customerState');
    if (stateSelect && stateSelect.options.length <= 1) { // Check if not already populated
        const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
        // Add a default blank option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select State --';
        stateSelect.appendChild(defaultOption);
        // Add state options
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}

// Function to reload all relevant data when horizon changes
function reloadDataForHorizon(newHorizon) {
    console.log('Reloading data for horizon:', newHorizon);
    currentHorizon = newHorizon; // Update global horizon

    // Re-fetch data that depends on the horizon
    // Example: fetchData('some-table', renderTable); // Uses updated global horizon
    // Example: fetchData('some-chart', 'renderSomeChart'); // Uses updated global horizon

    // Reload customer orders/chart if a customer is currently displayed
    if (currentCustomer) {
        loadOrders(currentCustomer.PersonID); // loadOrders implicitly calls updateChart
    }

    // Re-fetch dashboard-level charts/tables if they exist and are horizon-dependent
    // Add calls here if needed, e.g.,
    // fetchData('top_products', 'renderTopProductsChart');
    // fetchData('order_status', 'renderOrderStatusChart');
    // fetchData('customer_types', 'renderCustomerTypesChart');
    // fetchData('payment_status', 'renderPaymentStatusChart');
    // fetchData('salesperson_summary', 'renderSalespersonSummary'); // Assuming this uses renderTable
}

// Initialize dashboard elements and fetch initial data
function initializeDashboard() {
    console.log('Initializing dashboard with horizon:', currentHorizon);

    // --- Event Listeners ---
    // Time Horizon Picker
    document.querySelectorAll('#time-horizon-picker button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('#time-horizon-picker .active')?.classList.remove('active');
        btn.classList.add('active');
        reloadDataForHorizon(btn.dataset.horizon);
      });
    });

    // Customer Search (Button and Enter Key)
    document.querySelector('.search-section button').addEventListener('click', fetchCustomer);
    document.getElementById('searchCustomer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchCustomer();
        }
    });

    // Order Search Button
    // Ensure the button has a unique ID or class if needed, assuming it's the one next to #searchOrder input
    const searchOrderButton = document.querySelector('button[onclick="fetchOrder()"]');
    if (searchOrderButton) {
        searchOrderButton.onclick = fetchOrder; // Keep existing or use addEventListener
    } else {
        console.warn('Order search button not found.');
    }


    // Customer Edit Form (New)
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        handleCustomerUpdate();
    });
    document.getElementById('editCustomerBtn').addEventListener('click', enableCustomerEdit);
    // Find the cancel button within the saveSection and attach listener
    const cancelBtn = document.querySelector('#saveSection button[onclick="cancelEdit()"]');
     if (cancelBtn) {
         cancelBtn.onclick = cancelEdit; // Keep existing or use addEventListener
     } else {
         // If the button was dynamically added or structure changed, find differently
         const cancelBtnAlt = document.querySelector('#saveSection button.btn-secondary');
         if (cancelBtnAlt) cancelBtnAlt.addEventListener('click', cancelEdit);
         else console.warn('Cancel edit button not found.');
     }


    // "Create New" Form Type Selector
    document.getElementById('action_type').addEventListener('change', toggleCreateFields);

    // "Create Order" Add/Remove Item Buttons & Autocomplete Init
    document.getElementById('addMoreItems').addEventListener('click', addOrderRow);
    // Initialize autocomplete for any existing rows on load
    document.querySelectorAll('#orderItems .item-search').forEach(input => {
        initializeItemAutocomplete(input);
    });
     // Use event delegation for remove buttons as rows are added dynamically
     document.getElementById('orderItems').addEventListener('click', function(event) {
         if (event.target && event.target.classList.contains('removeRow')) {
             removeOrderRow(event.target);
         }
     });
     // Use event delegation for quantity input changes
     document.getElementById('orderItems').addEventListener('input', function(event) {
         if (event.target && event.target.classList.contains('quantity')) {
             updateOrderRowSubtotal(event.target.closest('tr'));
         }
     });


    // Older Edit Forms (Load Buttons) - Keep if needed
    const loadCustBtn = document.querySelector('button[onclick="loadCustomerForEdit()"]');
    if (loadCustBtn) loadCustBtn.onclick = loadCustomerForEdit;
    const loadPickupBtn = document.querySelector('button[onclick="loadPickupForEdit()"]');
    if (loadPickupBtn) loadPickupBtn.onclick = loadPickupForEdit;

    // Older Edit Forms (Submit Handlers) - Keep if needed
    const editCustForm = document.getElementById('editCustomerForm');
    if (editCustForm) editCustForm.onsubmit = () => { submitCustomerEdit(); return false; }; // Prevent default
    const editPickupForm = document.getElementById('editPickupForm');
    if (editPickupForm) editPickupForm.onsubmit = () => { submitPickupEdit(); return false; }; // Prevent default


    // --- Initial Setup ---
    populateStateDropdown(); // Populate the state dropdown in the customer edit form
    toggleCreateFields(); // Set initial visibility for create form sections
    loadComplaints(); // Load initial complaints list

    // Initial data fetches for dashboard charts/tables (if any are needed on load)
    // These might be redundant if the main view is customer-centric
    // fetchData('top_products', 'renderTopProductsChart');
    // fetchData('order_status', 'renderOrderStatusChart');
    // fetchData('customer_types', 'renderCustomerTypesChart');
    // fetchData('payment_status', 'renderPaymentStatusChart');
    // fetchData('salesperson_summary', 'renderSalespersonSummary'); // Assuming this uses renderTable

    console.log('Dashboard initialization complete.');
}

// Make initializeDashboard globally accessible if called from inline script
window.initializeDashboard = initializeDashboard;
