// charts.js

// 0) Default horizon = 6 months
let currentHorizon = '6M';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up horizon picker and fetching charts');

  // A) Wire up the time-horizon picker buttons
  document.querySelectorAll('#time-horizon-picker button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('#time-horizon-picker .active')?.classList.remove('active');
      btn.classList.add('active');
      currentHorizon = btn.dataset.horizon;
      console.log('Horizon →', currentHorizon);

      // Re-fetch all charts & tables
      [
        ['all-employees',       renderTable],
        ['revenue',             renderTable],
        ['inventory',           renderTable],
        ['top_products',        renderTopProductsChart],
        ['bottom_products',     renderBottomProductsChart],
        ['top_products_by_revenue', renderTopProductsRevenueChart],
        ['bottom_products_by_revenue', renderBottomProductsRevenueChart],
        ['order_status',        renderOrderStatusChart],
        ['customer_types',      renderCustomerTypesChart],
        ['payment_status',      renderPaymentStatusChart],
        ['salesperson_summary', renderSalespersonSummary],
        ['sales_by_category',   renderTable],
        ['canceled_revenue',    renderCanceledRevenue],
        ['avg_days_to_pickup',  renderAvgDaysToPickup],
        ['current_orders',      renderTable],
        ['customer_lifetime_value', renderCustomerLifetimeChart], 
        ['monthly_revenue_by_type', renderMonthlyRevenueByTypeChart],
        ['avg_revenue_per_customer', renderAvgRevenuePerCustomerChart],
        ['stock_turnover_rate', renderStockTurnoverChart],
        ['inventory_value_and_cost', renderInventoryValueCostChart],
        ['revenue_by_region', renderRevenueByRegionChart],
        ['revenue_by_category', renderRevenueByCategoryChart],
      ].forEach(([type, fn]) => fetchData(type, fn));
      
    });
  });

  // B) Initial fetch (6M default)
  fetchData('all-employees',      renderTable);
  fetchData('revenue',            renderTable);
  fetchData('inventory',          renderTable);
  fetchData('top_products',       renderTopProductsChart);
  fetchData('bottom_products',    renderBottomProductsChart);
  fetchData('top_products_by_revenue', renderTopProductsRevenueChart);
  fetchData('bottom_products_by_revenue', renderBottomProductsRevenueChart);
  fetchData('order_status',       renderOrderStatusChart);
  fetchData('customer_types',     renderCustomerTypesChart);
  fetchData('payment_status',     renderPaymentStatusChart);
  fetchData('salesperson_summary',renderSalespersonSummary);
  fetchData('sales_by_category', renderTable);   
  fetchData('canceled_revenue', renderCanceledRevenue);
  fetchData('avg_days_to_pickup', renderAvgDaysToPickup);
  fetchData('current_orders',     renderTable);
  fetchData('customer_lifetime_value',     renderCustomerLifetimeChart);
  fetchData('monthly_revenue_by_type', renderMonthlyRevenueByTypeChart);
  fetchData('avg_revenue_per_customer', renderAvgRevenuePerCustomerChart);
  fetchData('stock_turnover_rate', renderStockTurnoverChart);
  fetchData('inventory_value_and_cost', renderInventoryValueCostChart);
  fetchData('revenue_by_region', renderRevenueByRegionChart);
  fetchData('revenue_by_category', renderRevenueByCategoryChart);

});

// Generic data fetcher
function fetchData(type, callback) {
  const el = document.getElementById(type);
  if (!el) return;

  const url = `../includes/data.php?type=${type}`
            + `&horizon=${currentHorizon}`
            + `&_=${Date.now()}`;
  console.log('FETCH', url);

  fetch(url)
    .then(r => r.ok
      ? r.json()
      : r.json().then(e => { throw new Error(e.error||`HTTP ${r.status}`); })
    )
    .then(data => callback(type, data))
    .catch(err => {
      el.innerHTML = `<div class="error">Error: ${err.message}</div>`;
      console.error(type, err);
    });
}

// Utility to handle high-DPR screens
function fixCanvasResolution(canvas) {
  const dpr = window.devicePixelRatio||1, r = canvas.getBoundingClientRect();
  canvas.width  = r.width  * dpr;
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

// Render tables that automatically adjust to the data
function renderTable(type, data) {
  const c = document.getElementById(type);
  if (!c) return;
  if (!data || !data.length) {
    return void (c.innerHTML = '<div class="no-data">No data available</div>');
  }

  const cols = Object.keys(data[0]);
  let html = `<table><thead><tr>${cols.map(col=>`<th>${formatHeader(col)}</th>`).join('')}</tr></thead><tbody>`;
  data.forEach(row => {
    html += '<tr>' + cols.map(col => {
      const val = row[col];
      if (/price|revenue|amount/i.test(col))       return `<td>$${(+val).toFixed(2)}</td>`;
      if (/date/i.test(col))                       return `<td>${val?new Date(val).toLocaleDateString():''}</td>`;
      return `<td>${val}</td>`;
    }).join('') + '</tr>';
  });
  c.innerHTML = html + '</tbody></table>';
}

/* ---------------- CHART RENDERS ---------------- */

// Top Products: bar + line
function renderTopProductsChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('topProductsChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();  // destroy previous
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.product_name),
      datasets: [
        { label: 'Units Sold',  data: data.map(d => d.total_sold), yAxisID: 'y'   },
        { label: 'Revenue ($)', data: data.map(d => +d.total_revenue), type: 'line', borderColor: '#2196f3', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Top 10 Products by Sales Volume' } },
      scales: {
        y:  { beginAtZero: true, title: { display: true, text: 'Units Sold' } },
        y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Revenue ($)' } }
      }
    }
  });
}

function renderBottomProductsChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('bottomProductsChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();  // destroy previous
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.product_name),
      datasets: [
        { label: 'Units Sold',  data: data.map(d => d.total_sold), yAxisID: 'y' },
        { label: 'Revenue ($)', data: data.map(d => +d.total_revenue), type: 'line', borderColor: '#f44336', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Bottom 10 Products by Sales Volume' } },
      scales: {
        y:  { beginAtZero: true, title: { display: true, text: 'Units Sold' } },
        y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Revenue ($)' } }
      }
    }
  });
}

function renderCustomerLifetimeChart(_, data) {
  if (!data?.length) return;
  
  const canvas = document.getElementById('customerLifetimeChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.order_date),
      datasets: [{
        label: 'Avg. Customer Value ($)',
        data: data.map(d => +d.avg_customer_value),
        borderColor: '#3f51b5',
        backgroundColor: '#c5cae9',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Average Customer Lifetime Value Over Time'
        }
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Avg. Value ($)'
          }
        }
      }
    }
  });
}


// Order Status: pie chart
function renderOrderStatusChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('orderStatusChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(d => d.status),
      datasets: [{ data: data.map(d => d.count), backgroundColor: ['#2196f3','#f44336','#ffc107','#8bc34a','#9c27b0','#ff9800'] }]
    },
    options: { plugins: { title: { display: true, text: 'Order Status Distribution' } } }
  });
}

// Customer Types: doughnut
function renderCustomerTypesChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('customerTypesChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.type),
      datasets: [{ data: data.map(d => d.count), backgroundColor: ['#ff9800','#2196f3'] }]
    },
    options: { plugins: { title: { display: true, text: 'Customer Types Distribution' } } }
  });
}

// Payment Status: bar
// Payment Status: bar
// Payment Status: bar


function renderPaymentStatusChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('paymentStatusChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  const colors = { 'Paid': '#10d837', 'Pending': '#ffc107', 'Overdue': '#f44336' };

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.status), //You MUST keep this for correct x-axis labels
      datasets: [{
        // 🚫 Do NOT set 'label' here — that triggers legend
        data: data.map(d => d.count),
        backgroundColor: data.map(d => colors[d.status] || '#999')
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Payment Status Distribution'
        },
        legend: {
          display: false // This now works correctly since no dataset label exists
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Payment Status'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Orders'
          }
        }
      }
    }
  });
}

// Salesperson Summary: bar + table
function renderSalespersonSummary(_, data) {
  const container = document.getElementById('salesperson_summary');
  if (!container) {
    console.error('Container element not found');
    return;
  }
  
  if (!data?.length) {
    return void (container.innerHTML = '<div class="no-data">No data available</div>');
  }

  // Check if canvas exists, if not create it
  let canvas = document.getElementById('salespersonSummaryChart');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'salespersonSummaryChart';
    container.appendChild(canvas);
  }
  
  // Now continue with the rest of your function
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  const labels = data.map(d => d.salesperson_name);
  const revenues = data.map(d => +d.total_revenue);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.salesperson_name),
      datasets: [{
        label: 'Revenue ($)',
        data: data.map(d => +d.total_revenue),
        backgroundColor: '#4caf50'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Salesperson Performance Summary'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue ($)'
          }
        }
      }
    }
  });

  // append summary table
  let html = '<h3>Salesperson Revenue Details</h3><table><thead><tr>'
           + '<th>Salesperson</th><th>Orders</th><th>Total Revenue</th></tr></thead><tbody>';
  let totRev = 0, totOrd = 0;
  data.forEach(r => {
    html += `<tr><td>${r.salesperson_name}</td><td>${r.total_orders}</td>`
         + `<td>$${(+r.total_revenue).toFixed(2)}</td></tr>`;
    totOrd += +r.total_orders; totRev += +r.total_revenue;
  });
  html += `<tr class="total-row"><td><strong>Total</strong></td>`
        + `<td><strong>${totOrd}</strong></td><td><strong>$${totRev.toFixed(2)}</strong></td></tr>`
        + '</tbody></table>';
  container.insertAdjacentHTML('beforeend', html);

}
  
  // Render total revenue lost from canceled orders
  function renderCanceledRevenue(type, data) {
    const el = document.getElementById(type);
    if (!el) return;
    
    const amt = data?.[0]?.lost_revenue ?? null;
    if (amt === null) {
      el.innerHTML = '<div class="no-data">No canceled revenue.</div>';
      return;
    }
  
    const value = (+amt).toFixed(2);
    const isZero = (value == 0 || value === "0.00");
    const color = isZero ? '#4caf50' : '#f44336';
    
    // Always slap a "-" manually if it's not zero
    const formattedValue = isZero ? `$${value}` : `-$${value}`;
  
    el.innerHTML = `<h2 style="color:${color}; text-align:center;">${formattedValue}</h2>`;
  }
  
  
  function renderAvgDaysToPickup(type, data) {
    const el = document.getElementById(type);
    if (!el) return;
  
    if (!Array.isArray(data) || !data.length) {
      el.innerHTML = '<div class="no-data">No pickup data available.</div>';
      return;
    }
  
    const avg = Number(data[0]?.avg_days);
    if (isNaN(avg)) {
      el.innerHTML = '<div class="no-data">Invalid pickup data.</div>';
      return;
    }
    
    el.innerHTML = `<h2 style="text-align:center;">${avg.toFixed(2)} days</h2>`;
   
    
    
  }

function renderTopProductsRevenueChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('topProductsRevenueChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.product_name),
      datasets: [
        { label: 'Revenue ($)', data: data.map(d => +d.total_revenue), backgroundColor: '#2196f3' },
        { label: 'Units Sold', data: data.map(d => d.total_sold), type: 'line', borderColor: '#4caf50', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Top 10 Products by Revenue' } },
      scales: {
        y:  { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
        y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Units Sold' } }
      }
    }
  });
}

function renderBottomProductsRevenueChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('bottomProductsRevenueChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.product_name),
      datasets: [
        { label: 'Revenue ($)', data: data.map(d => +d.total_revenue), backgroundColor: '#f44336' },
        { label: 'Units Sold', data: data.map(d => d.total_sold), type: 'line', borderColor: '#2196f3', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Bottom 10 Products by Revenue' } },
      scales: {
        y:  { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
        y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Units Sold' } }
      }
    }
  });
}

// --- Chart renderers for new graphs ---
function renderMonthlyRevenueByTypeChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('monthlyRevenueByTypeChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  // Group by month, then by type
  const months = [...new Set(data.map(d => d.month))];
  const types = [...new Set(data.map(d => d.CustomerType))];
  const datasets = types.map(type => ({
    label: type,
    data: months.map(m => {
      const found = data.find(d => d.month === m && d.CustomerType === type);
      return found ? +found.revenue : 0;
    }),
    borderWidth: 2,
    fill: false,
    tension: 0.2
  }));

  new Chart(ctx, {
    type: 'line',
    data: { labels: months, datasets },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Monthly Revenue by Customer Type' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
        x: { title: { display: true, text: 'Month' } }
      }
    }
  });
}

function renderAvgRevenuePerCustomerChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('avgRevenuePerCustomerChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.month),
      datasets: [{
        label: 'Avg Revenue/Customer',
        data: data.map(d => +d.avg_revenue_per_customer),
        borderColor: '#673ab7',
        backgroundColor: '#d1c4e9',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Average Revenue Per Customer Per Month' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Avg Revenue ($)' } },
        x: { title: { display: true, text: 'Month' } }
      }
    }
  });
}

// Stock Turnover Rate Over Time
function renderStockTurnoverChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('stockTurnoverChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');

  // Group products into top 5 and bottom 5 by total units sold
  const productTotals = {};
  data.forEach(d => {
    if (!productTotals[d.ProductName]) productTotals[d.ProductName] = 0;
    productTotals[d.ProductName] += +d.units_sold;
  });
  const sortedProducts = Object.entries(productTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  const top5 = sortedProducts.slice(0, 5);
  const bottom5 = sortedProducts.slice(-5);
  const months = [...new Set(data.map(d => d.month))];
  const datasets = [];
  top5.forEach(product => {
    datasets.push({
      label: product + ' (Top 5)',
      data: months.map(m => {
        const found = data.find(d => d.month === m && d.ProductName === product);
        return found ? +found.turnover_rate : 0;
      }),
      borderWidth: 2,
      fill: false,
      tension: 0.2,
      borderColor: '#1976d2',
      backgroundColor: '#1976d2'
    });
  });
  bottom5.forEach(product => {
    datasets.push({
      label: product + ' (Bottom 5)',
      data: months.map(m => {
        const found = data.find(d => d.month === m && d.ProductName === product);
        return found ? +found.turnover_rate : 0;
      }),
      borderWidth: 2,
      fill: false,
      tension: 0.2,
      borderDash: [6, 4],
      borderColor: '#c62828',
      backgroundColor: '#c62828'
    });
  });
  new Chart(ctx, {
    type: 'line',
    data: { labels: months, datasets },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Stock Turnover Rate Over Time (Top 5 & Bottom 5 by Volume)' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Turnover Rate' } },
        x: { title: { display: true, text: 'Month' } }
      }
    }
  });
}

// Inventory Value & Holding Cost Per Month
function renderInventoryValueCostChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('inventoryValueCostChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: 'Inventory Value',
          data: data.map(d => +d.total_inventory_value),
          borderColor: '#1976d2',
          backgroundColor: '#90caf9',
          fill: false,
          tension: 0.2
        },
        {
          label: 'Holding Cost',
          data: data.map(d => +d.total_holding_cost),
          borderColor: '#c62828',
          backgroundColor: '#ef9a9a',
          fill: false,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Inventory Value & Holding Cost Per Month' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Value / Cost ($)' } },
        x: { title: { display: true, text: 'Month' } }
      }
    }
  });
}

// Revenue by Region (Bar)
function renderRevenueByRegionChart(_, data) {
  const canvas = document.getElementById('revenueByRegionChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');
  if (!data || !data.length) {
    canvas.style.display = 'none';
    document.getElementById('revenue_by_region').innerHTML = '<div class="no-data">No region revenue data available.</div>';
    return;
  }
  canvas.style.display = '';
  // Always show all regions, even if missing from data
  const allRegions = ['Southwest','Southeast','Pacific','Great Plains','Great Lakes','Northeast'];
  const regionMap = {};
  data.forEach(d => regionMap[d.region] = +d.revenue);
  const labels = allRegions;
  const values = labels.map(r => regionMap[r] || 0);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Revenue',
        data: values,
        backgroundColor: '#43a047'
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Revenue by Region' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
        x: { title: { display: true, text: 'Region' } }
      }
    }
  });
}

// Revenue by Product Category (Bar)
function renderRevenueByCategoryChart(_, data) {
  if (!data?.length) return;
  const canvas = document.getElementById('revenueByCategoryChart');
  fixCanvasResolution(canvas);
  Chart.getChart(canvas)?.destroy();
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.Category),
      datasets: [{
        label: 'Revenue',
        data: data.map(d => +d.revenue),
        backgroundColor: '#ff9800'
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Revenue by Product Category' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Revenue ($)' } },
        x: { title: { display: true, text: 'Category' } }
      }
    }
  });
}