// Chart rendering functions (ensure these are globally accessible or called via window)

// Helper function to aggregate order data by month for the lifetime chart
function aggregateOrdersByMonth(orders) {
    const monthlyTotals = {};
    orders.forEach(order => {
        const date = new Date(order.OrderDate);
        // Format as YYYY-MM for consistent grouping
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = 0;
        }
        monthlyTotals[monthKey] += parseFloat(order.Total);
    });

    // Sort keys chronologically
    const sortedKeys = Object.keys(monthlyTotals).sort();
    const sortedMonthlyTotals = {};
    sortedKeys.forEach(key => {
        sortedMonthlyTotals[key] = monthlyTotals[key];
    });

    return sortedMonthlyTotals;
}

