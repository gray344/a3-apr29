<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manager Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="dashboard.css">
</head>

<div class="logout-container">
  <button onclick="window.location.href='logout.php'" class="logout-btn">Log Out</button>
</div>

<body>
  <header>
    <h1>MANAGER DASHBOARD</h1>
  </header>

  <!-- 1) Time‐Horizon Picker -->
  <div class="horizon-picker" id="time-horizon-picker">
    <button data-horizon="1M">1 M</button>
    <button data-horizon="6M" class="active">6 M</button>
    <button data-horizon="1Y">1 Y</button>
    <button data-horizon="5Y">5 Y</button>
    <button data-horizon="MAX">MAX</button>
  </div>


  <div class="summary-row" style="display: flex; gap: 24px; margin: 0 0 20px 0; width: 90vw; max-width: 90vw; margin-left: auto; margin-right: auto;">
    <div class="card" style="flex:1; min-width:260px; max-width: 45vw;">
      <div class="card-header">Revenue Lost from Canceled Orders</div>
      <div class="card-body">
        <div id="canceled_revenue"></div>
      </div>
    </div>
    <div class="card" style="flex:1; min-width:260px; max-width: 45vw;">
      <div class="card-header">Avg. Days Between Order & Pickup</div>
      <div class="card-body">
        <div id="avg_days_to_pickup"></div>
      </div>
    </div>
  </div>

  <div class="container">

      <!-- Left Column: Employee Tables & Charts -->
      <div class="left-column">
        <div class="card" style="min-width: 300px;">
          <div class="card-header">EMPLOYEE DETAILS</div>
          <div class="card-body">
            <div id="all-employees" class="loading">Loading...</div>
          </div>
        </div>

      <div class="card">
        <div class="card-header">Salesperson Performance</div>
        <div class="card-body">
          <div id="salesperson_summary" class="chart-container"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">Sales by Category</div>
        <div class="card-body">
          <div id="sales_by_category"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">INVENTORY</div>
        <div class="card-body">
          <div id="inventory" class="loading">Loading...</div>
        </div>
      </div>

    </div>

    <!-- Right Column: Charts -->
    <div class="right-column">
      <div class="card" style="grid-column: span 2; max-height: 900px; overflow-y: auto;">
        <div class="card-header">Top & Bottom 10 Products <span style="font-weight:normal;font-size:0.9em;">(by Quantity & Revenue)</span></div>
        <div class="card-body" style="max-height: 800px; overflow-y: auto; display: flex; flex-direction: column; align-items: center;">
          <div class="chart-container" style="margin-bottom:2rem; min-width:600px; width:100%; max-width:900px; display:none;" id="top10QuantityContainer">
            <div style="font-weight:600;margin-bottom:0.5rem;">Top 10 by Quantity</div>
            <canvas id="topProductsChart" width="800" height="400"></canvas>
            <div id="top_products"></div>
          </div>
          <div class="chart-container" style="margin-bottom:2rem; min-width:600px; width:100%; max-width:900px; display:none;" id="top10RevenueContainer">
            <div style="font-weight:600;margin-bottom:0.5rem;">Top 10 by Revenue</div>
            <canvas id="topProductsRevenueChart" width="800" height="400"></canvas>
            <div id="top_products_by_revenue"></div>
          </div>
          <div class="chart-container" style="margin-bottom:2rem; min-width:600px; width:100%; max-width:900px; display:none;" id="bottom10QuantityContainer">
            <div style="font-weight:600;margin-bottom:0.5rem;">Bottom 10 by Quantity</div>
            <canvas id="bottomProductsChart" width="800" height="400"></canvas>
            <div id="bottom_products"></div>
          </div>
          <div class="chart-container" style="min-width:600px; width:100%; max-width:900px; display:none;" id="bottom10RevenueContainer">
            <div style="font-weight:600;margin-bottom:0.5rem;">Bottom 10 by Revenue</div>
            <canvas id="bottomProductsRevenueChart" width="800" height="400"></canvas>
            <div id="bottom_products_by_revenue"></div>
          </div>
          <div style="text-align:center; margin-top:1rem;">
            <button onclick="showProductChart('top10Quantity')">Top 10 by Quantity</button>
            <button onclick="showProductChart('top10Revenue')">Top 10 by Revenue</button>
            <button onclick="showProductChart('bottom10Quantity')">Bottom 10 by Quantity</button>
            <button onclick="showProductChart('bottom10Revenue')">Bottom 10 by Revenue</button>
          </div>
        </div>
      </div>
      <script>
      function showProductChart(which) {
        ['top10Quantity','top10Revenue','bottom10Quantity','bottom10Revenue'].forEach(id => {
          document.getElementById(id+'Container').style.display = (id === which) ? '' : 'none';
        });
      }
      // Show the first chart by default
      document.addEventListener('DOMContentLoaded', function() {
        showProductChart('top10Quantity');
      });
      </script>
      
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Average Customer Lifetime Value</div>
        <div class="card-body">
          <canvas id="customerLifetimeChart"></canvas>
          <div id="customer_lifetime_value"></div>
        </div>
      </div>

      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Current Pending Orders & Complaints</div>
        <div class="card-body">
          <div id ="current_orders"></div>
        </div>
      </div>

      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Monthly Revenue Trends by Customer Type</div>
        <div class="card-body">
          <canvas id="monthlyRevenueByTypeChart"></canvas>
          <div id="monthly_revenue_by_type"></div>
        </div>
      </div>
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Average Revenue Per Customer Per Month</div>
        <div class="card-body">
          <canvas id="avgRevenuePerCustomerChart"></canvas>
          <div id="avg_revenue_per_customer"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Order Status Distribution</div>
        <div class="card-body">
          <canvas id="orderStatusChart"></canvas>
          <div id="order_status"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Payment Status</div>
        <div class="card-body">
          <canvas id="paymentStatusChart"></canvas>
          <div id="payment_status"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Customer Types</div>
        <div class="card-body">
          <canvas id="customerTypesChart"></canvas>
          <div id="customer_types"></div>
        </div>
      </div>
      <div class="card" style="grid-column: span 2; max-height: 600px; overflow-y: auto;">
        <div class="card-header">Stock Turnover Rate Over Time</div>
        <div class="card-body" style="min-width:700px; min-height:500px; overflow-x:auto;">
          <div style="width:1200px;">
            <canvas id="stockTurnoverChart" style="width:1100px; height:400px;"></canvas>
          </div>
          <div id="stock_turnover_rate"></div>
        </div>
      </div>
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Inventory Value & Holding Cost Per Month</div>
        <div class="card-body">
          <canvas id="inventoryValueCostChart"></canvas>
          <div id="inventory_value_and_cost"></div>
        </div>
      </div>
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Revenue by Region</div>
        <div class="card-body">
          <canvas id="revenueByRegionChart"></canvas>
          <div id="revenue_by_region"></div>
        </div>
      </div>
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">Revenue by Product Category</div>
        <div class="card-body">
          <canvas id="revenueByCategoryChart"></canvas>
          <div id="revenue_by_category"></div>
        </div>
      </div>

    </div>
  </div>

  <!-- Scroll to Top Button -->
<button onclick="topFunction()" id="myBtn" title="Go to top">Top</button>
<script>
// Get the button
// Get the button
let mybutton = document.getElementById("myBtn");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.classList.add('show'); // <- FADE IN
  } else {
    mybutton.classList.remove('show'); // <- FADE OUT
  }
}

function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
}

</script>

<script src="manager_charts.js?v=<?= time() ?>"></script>
  
</body>
</html>
