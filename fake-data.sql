-- fake_data.sql
-- Sample data to populate the database with realistic entries

-- Additional People (for customers)
INSERT INTO People (PersonID, FirstName, LastName, Email, PhoneNumber, StreetAddress, City, State, ZipCode)
VALUES
-- Individual customers (starting from ID 6 to avoid conflicts with startup_data)
(6, 'Robert', 'Anderson', 'robert.anderson@email.com', '555-111-2222', '742 Evergreen Terrace', 'Springfield', 'IL', '62701'),
(7, 'Jennifer', 'Martinez', 'jennifer.m@email.com', '555-222-3333', '123 Maple Drive', 'Chicago', 'IL', '60601'),
(8, 'Thomas', 'Wilson', 'thomas.wilson@email.com', '555-333-4444', '456 Oak Street', 'Peoria', 'IL', '61602'),
(9, 'Jessica', 'Brown', 'jessica.brown@email.com', '555-444-5555', '789 Pine Avenue', 'Rockford', 'IL', '61101'),
(10, 'Christopher', 'Taylor', 'chris.taylor@email.com', '555-555-6666', '101 Cedar Lane', 'Aurora', 'IL', '60505'),
(11, 'Ashley', 'Davis', 'ashley.davis@email.com', '555-666-7777', '202 Birch Street', 'Naperville', 'IL', '60540'),
(12, 'Matthew', 'Garcia', 'matt.garcia@email.com', '555-777-8888', '303 Walnut Road', 'Joliet', 'IL', '60431'),
(13, 'Amanda', 'Lopez', 'amanda.lopez@email.com', '555-888-9999', '404 Spruce Court', 'Springfield', 'IL', '62704'),
(14, 'Daniel', 'Lee', 'daniel.lee@email.com', '555-999-0000', '505 Elm Boulevard', 'Champaign', 'IL', '61820'),
(15, 'Stephanie', 'Gonzalez', 'steph.g@email.com', '555-000-1111', '606 Pineapple Way', 'Bloomington', 'IL', '61701'),
(25, 'Ethan', 'Miller', 'ethan.miller@email.com', '555-123-4567', '123 Elm Street', 'Decatur', 'IL', '62521'),
(26, 'Olivia', 'Johnson', 'olivia.j@email.com', '555-234-5678', '456 Maple Avenue', 'Carbondale', 'IL', '62901'),
(27, 'Sophia', 'White', 'sophia.white@email.com', '555-345-6789', '789 Oak Lane', 'Quincy', 'IL', '62301'),
(28, 'Liam', 'Moore', 'liam.moore@email.com', '555-456-7890', '101 Pine Street', 'Evanston', 'IL', '60201'),
(29, 'Emma', 'Taylor', 'emma.taylor@email.com', '555-567-8901', '202 Birch Avenue', 'Normal', 'IL', '61761'),

-- Company representative contacts (fixed to start from ID 20 to avoid conflicts)
(20, 'James', 'Carter', 'james.carter@techinnovate.com', '555-112-3344', '1000 Tech Park', 'Chicago', 'IL', '60607'),
(21, 'Linda', 'Thompson', 'linda.t@foodcorp.com', '555-223-4455', '2000 Food Avenue', 'Chicago', 'IL', '60608'),
(22, 'William', 'Harris', 'william.h@furniturefirst.com', '555-334-5566', '3000 Furniture Boulevard', 'Springfield', 'IL', '62711'),
(23, 'Patricia', 'Clark', 'patricia.c@fashionforward.com', '555-445-6677', '4000 Fashion Street', 'Chicago', 'IL', '60609'),
(24, 'Richard', 'Lewis', 'richard.l@officesuppliers.com', '555-556-7788', '5000 Office Road', 'Peoria', 'IL', '61604'),
(30, 'Henry', 'Walker', 'henry.walker@techsolutions.com', '555-678-9012', '6000 Innovation Drive', 'Springfield', 'IL', '62703'),
(31, 'Isabella', 'Scott', 'isabella.scott@foodworld.com', '555-789-0123', '7000 Food Plaza', 'Chicago', 'IL', '60610'),
(32, 'Mason', 'Adams', 'mason.adams@furnishings.com', '555-890-1234', '8000 Furniture Way', 'Peoria', 'IL', '61605'),
(33, 'Ava', 'Mitchell', 'ava.mitchell@stylehub.com', '555-901-2345', '9000 Fashion Lane', 'Chicago', 'IL', '60611'),
(34, 'Lucas', 'Perez', 'lucas.perez@officesolutions.com', '555-012-3456', '10000 Office Park', 'Rockford', 'IL', '61102');

-- Customers (including individuals from 6-15 and companies from 20-24)
INSERT INTO Customers (PersonID, CustomerType)
VALUES
(6, 'Individual'),
(7, 'Individual'),
(8, 'Individual'),
(9, 'Individual'),
(10, 'Individual'),
(11, 'Individual'),
(12, 'Individual'),
(13, 'Individual'),
(14, 'Individual'),
(15, 'Individual'),
(20, 'Company'),
(21, 'Company'),
(22, 'Company'),
(23, 'Company'),
(24, 'Company'),
(25, 'Individual'),
(26, 'Individual'),
(27, 'Individual'),
(28, 'Individual'),
(29, 'Individual'),
(30, 'Company'),
(31, 'Company'),
(32, 'Company'),
(33, 'Company'),
(34, 'Company');

-- Individual Customers
INSERT INTO IndividualCustomers (PersonID)
VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15), (25), (26), (27), (28), (29);

-- Company Customers (updated PersonIDs)
INSERT INTO CompanyCustomers (PersonID, CompanyName, TaxID)
VALUES
(20, 'TechInnovate Solutions', '12-3456789'),
(21, 'FoodCorp Industries', '23-4567890'),
(22, 'Furniture First', '34-5678901'),
(23, 'Fashion Forward', '45-6789012'),
(24, 'Office Suppliers Inc.', '56-7890123'),
(30, 'Tech Solutions Inc.', '65-4321098'),
(31, 'Food World LLC', '76-5432109'),
(32, 'Furnishings Co.', '87-6543210'),
(33, 'Style Hub', '98-7654321'),
(34, 'Office Solutions Ltd.', '09-8765432');

-- Orders (various statuses and dates)
INSERT INTO Orders (InvoiceNumber, CustomerID, OrderDate, InvoiceDate, PaymentStatus, Status)
VALUES
-- Individual customer orders
(1, 5, '2024-01-05', '2024-01-05', 'Paid', 'Cancelled'),
(2, 6, '2024-01-12', '2024-01-12', 'Paid', 'PickedUp'),
(3, 7, '2024-01-20', '2024-01-20', 'Paid', 'PickedUp'),
(4, 8, '2024-02-03', '2024-02-03', 'Paid', 'PickedUp'),
(5, 9, '2024-02-15', '2024-02-15', 'Paid', 'PickedUp'),
(6, 10, '2024-02-27', '2024-02-27', 'Paid', 'PickedUp'),
(7, 11, '2024-03-08', '2024-03-08', 'Paid', 'PickedUp'),
(8, 12, '2024-03-17', '2024-03-17', 'Paid', 'PickedUp'),
(9, 10, '2024-03-25', '2024-03-25', 'Paid', 'PickedUp'),
(10, 8, '2024-04-02', '2024-04-02', 'Paid', 'PickedUp'),
(11, 6, '2024-04-10', NULL, 'Pending', 'Pending'),
(12, 5, '2024-04-12', NULL, 'Pending', 'Pending'),
(13, 20, '2024-01-10', '2024-01-10', 'Paid', 'PickedUp'),
(14, 21, '2024-01-25', '2024-01-25', 'Paid', 'PickedUp'),
(15, 22, '2024-02-08', '2024-02-08', 'Paid', 'PickedUp'),
(16, 23, '2024-02-20', '2024-02-20', 'Paid', 'PickedUp'),
(17, 24, '2024-03-05', '2024-03-05', 'Paid', 'PickedUp'),
(18, 20, '2024-03-15', '2024-03-15', 'Overdue', 'PickedUp'),
(19, 22, '2024-03-30', '2024-03-30', 'Paid', 'PickedUp'),
(20, 24, '2024-04-08', NULL, 'Pending', 'Pending'),
(21, 23, '2024-04-11', NULL, 'Pending', 'Pending'),
(22, 25, '2024-04-15', '2024-04-15', 'Paid', 'PickedUp'),
(23, 26, '2024-04-16', '2024-04-16', 'Paid', 'PickedUp'),
(24, 27, '2024-04-17', '2024-04-17', 'Paid', 'PickedUp'),
(25, 28, '2024-04-18', '2024-04-18', 'Paid', 'PickedUp'),
(26, 29, '2024-04-19', '2024-04-19', 'Paid', 'PickedUp'),
(27, 30, '2024-04-20', '2024-04-20', 'Pending', 'Pending'),
(28, 31, '2024-04-21', '2024-04-21', 'Pending', 'Pending'),
(29, 32, '2024-04-22', '2024-04-22', 'Paid', 'PickedUp'),
(30, 33, '2024-04-23', '2024-04-23', 'Pending', 'Pending'),
(31, 34, '2024-04-24', '2024-04-24', 'Paid', 'PickedUp');

-- Order Details
INSERT INTO OrderDetails (InvoiceNumber, ProductID, Quantity, UnitPrice)
VALUES
-- Order 1 (Robert Anderson)
(1, 1, 1, 899.99),  -- Ultra HD Smart TV 55"
(1, 4, 1, 249.99),  -- Wireless Noise-Cancelling Headphones

-- Order 2 (Jennifer Martinez)
(2, 3, 1, 1299.99),  -- Premium Laptop Pro
(2, 4, 1, 249.99),   -- Wireless Noise-Cancelling Headphones

-- Order 3 (Thomas Wilson)
(3, 5, 2, 59.99),    -- Classic Denim Jeans
(3, 6, 3, 24.99),    -- Premium Cotton T-Shirt

-- Order 4 (Jessica Brown)
(4, 7, 1, 299.99),   -- Ergonomic Office Chair
(4, 8, 1, 199.99),   -- Modern Coffee Table

-- Order 5 (Christopher Taylor)
(5, 10, 3, 8.99),    -- Organic Granola
(5, 11, 2, 14.99),   -- Premium Coffee Beans
(5, 12, 2, 12.99),   -- Frozen Mixed Berries

-- Order 6 (Ashley Davis)
(6, 9, 1, 899.99),   -- Sectional Sofa
(6, 8, 2, 199.99),   -- Modern Coffee Table

-- Order 7 (Matthew Garcia)
(7, 2, 1, 1199.99),  -- Ultra HD Smart TV 65"
(7, 3, 1, 1299.99),  -- Premium Laptop Pro

-- Order 8 (Amanda Lopez)
(8, 5, 3, 59.99),    -- Classic Denim Jeans
(8, 6, 5, 24.99),    -- Premium Cotton T-Shirt
(8, 13, 2, 24.99),   -- Artisanal Cheese Selection

-- Order 9 (Stephanie repeat)
(9, 7, 1, 299.99),   -- Ergonomic Office Chair
(9, 10, 2, 8.99),    -- Organic Granola

-- Order 10 (Jessica repeat)
(10, 11, 3, 14.99),  -- Premium Coffee Beans
(10, 12, 3, 12.99),  -- Frozen Mixed Berries

-- Order 11 (Jennifer pending)
(11, 1, 1, 899.99),  -- Ultra HD Smart TV 55"
(11, 9, 1, 899.99),  -- Sectional Sofa

-- Order 12 (Robert pending)
(12, 8, 2, 199.99),  -- Modern Coffee Table
(12, 13, 3, 24.99),  -- Artisanal Cheese Selection

-- Order 13 (TechInnovate Solutions)
(13, 3, 5, 1249.99),  -- Premium Laptop Pro (bulk price)
(13, 4, 5, 229.99),   -- Wireless Noise-Cancelling Headphones (bulk price)

-- Order 14 (FoodCorp Industries)
(14, 10, 25, 7.99),   -- Organic Granola (bulk price)
(14, 11, 30, 12.99),  -- Premium Coffee Beans (bulk price)
(14, 12, 20, 10.99),  -- Frozen Mixed Berries (bulk price)
(14, 13, 15, 22.99),  -- Artisanal Cheese Selection (bulk price)

-- Order 15 (Furniture First)
(15, 7, 10, 279.99),  -- Ergonomic Office Chair (bulk price)
(15, 8, 8, 179.99),   -- Modern Coffee Table (bulk price)
(15, 9, 5, 849.99),   -- Sectional Sofa (bulk price)

-- Order 16 (Fashion Forward)
(16, 5, 50, 49.99),   -- Classic Denim Jeans (bulk price)
(16, 6, 100, 19.99),  -- Premium Cotton T-Shirt (bulk price)

-- Order 17 (Office Suppliers Inc.)
(17, 3, 10, 1199.99), -- Premium Laptop Pro (bulk price)
(17, 7, 15, 269.99),  -- Ergonomic Office Chair (bulk price)

-- Order 18 (TechInnovate Solutions repeat)
(18, 1, 8, 849.99),   -- Ultra HD Smart TV 55" (bulk price)
(18, 2, 5, 1099.99),  -- Ultra HD Smart TV 65" (bulk price)

-- Order 19 (Furniture First repeat)
(19, 8, 10, 179.99),  -- Modern Coffee Table (bulk price)
(19, 9, 3, 849.99),   -- Sectional Sofa (bulk price)

-- Order 20 (Office Suppliers Inc. pending)
(20, 3, 8, 1199.99),  -- Premium Laptop Pro (bulk price)
(20, 4, 15, 219.99),  -- Wireless Noise-Cancelling Headphones (bulk price)

-- Order 21 (Fashion Forward pending)
(21, 5, 30, 49.99),   -- Classic Denim Jeans (bulk price)
(21, 6, 45, 19.99),   -- Premium Cotton T-Shirt (bulk price)

-- Order 22 (Ethan Miller)
(22, 1, 1, 899.99),  -- Ultra HD Smart TV 55"
(22, 4, 2, 249.99),  -- Wireless Noise-Cancelling Headphones

-- Order 23 (Olivia Johnson)
(23, 3, 1, 1299.99), -- Premium Laptop Pro
(23, 6, 3, 24.99),   -- Premium Cotton T-Shirt

-- Order 24 (Sophia White)
(24, 5, 2, 59.99),   -- Classic Denim Jeans
(24, 7, 1, 299.99),  -- Ergonomic Office Chair

-- Order 25 (Liam Moore)
(25, 8, 1, 199.99),  -- Modern Coffee Table
(25, 9, 1, 899.99),  -- Sectional Sofa

-- Order 26 (Emma Taylor)
(26, 10, 3, 8.99),   -- Organic Granola
(26, 11, 2, 14.99),  -- Premium Coffee Beans

-- Order 27 (Tech Solutions Inc.)
(27, 3, 10, 1249.99), -- Premium Laptop Pro (bulk price)
(27, 4, 5, 229.99),   -- Wireless Noise-Cancelling Headphones (bulk price)

-- Order 28 (Food World LLC)
(28, 10, 50, 7.99),   -- Organic Granola (bulk price)
(28, 11, 30, 12.99),  -- Premium Coffee Beans (bulk price)

-- Order 29 (Furnishings Co.)
(29, 7, 15, 279.99),  -- Ergonomic Office Chair (bulk price)
(29, 8, 10, 179.99),  -- Modern Coffee Table (bulk price)

-- Order 30 (Style Hub)
(30, 5, 100, 49.99),  -- Classic Denim Jeans (bulk price)
(30, 6, 200, 19.99),  -- Premium Cotton T-Shirt (bulk price)

-- Order 31 (Office Solutions Ltd.)
(31, 3, 20, 1199.99), -- Premium Laptop Pro (bulk price)
(31, 7, 25, 269.99);  -- Ergonomic Office Chair (bulk price)

-- Pickups
INSERT INTO Pickups (OrderID, ScheduledDate, ScheduledByEmployeeID, PickedUpByCustomerID, Status)
VALUES
-- Completed pickups
(1, '2024-01-07', 3, 5, 'Completed'),
(2, '2024-01-14', 4, 6, 'Completed'),
(3, '2024-01-22', 3, 7, 'Completed'),
(4, '2024-02-05', 4, 8, 'Completed'),
(5, '2024-02-17', 3, 9, 'Completed'),
(6, '2024-03-01', 4, 10, 'Completed'),
(7, '2024-03-10', 3, 11, 'Completed'),
(8, '2024-03-19', 4, 12, 'Completed'),
(9, '2024-03-27', 3, 10, 'Completed'),
(10, '2024-04-04', 4, 8, 'Completed'),
(13, '2024-01-12', 1000000005, 20, 'Completed'),
(14, '2024-01-27', 1000000005, 21, 'Completed'),
(15, '2024-02-10', 1000000002, 22, 'Completed'),
(16, '2024-02-22', 1000000002, 23, 'Completed'),
(17, '2024-03-07', 1000000004, 24, 'Completed'),
(18, '2024-03-17', 1000000004, 20, 'Completed'),
(19, '2024-04-01', 1000000003, 22, 'Completed'),

-- Scheduled pickups
(11, '2024-04-15', 3, 6, 'Scheduled'),
(12, '2024-04-16', 4, 5, 'Scheduled'),
(20, '2024-04-12', 1, 24, 'Pending'),
(21, '2024-04-14', 2, 23, 'Pending');

-- Complaints
INSERT INTO Complaints (ComplaintID, CustomerID, EmployeeID, OrderID, ComplaintText, ResolveText, Status, CreatedAt)
VALUES
-- Resolved complaints
(1, 8, 4, 4, 'The office chair I received has a broken wheel.', 'We apologize for the inconvenience. A replacement chair has been delivered.', 'Resolved', '2024-02-06 14:30:00'),
(2, 10, 3, 6, 'One of the coffee tables arrived with scratches on the top surface.', 'We have provided a 20% refund and will send a replacement table next week.', 'Resolved', '2024-03-02 10:15:00'),
(3, 20, 1, 13, 'Two of the laptops we ordered are missing power adapters.', 'The missing power adapters have been delivered on March 20th.', 'Resolved', '2024-01-15 09:45:00'),

-- In progress complaints
(4, 9, 3, 5, 'The frozen berries arrived partially thawed.', 'We are investigating this issue with our cold chain logistics team.', 'In Progress', '2024-02-18 16:20:00'),
(5, 22, 2, 15, 'Three of the office chairs have different colors than what we ordered.', 'We are arranging for pickup and replacement of the incorrectly colored chairs.', 'In Progress', '2024-02-12 11:10:00'),

-- Open complaints
(6, 7, NULL, 3, 'The jeans I received are the wrong size.', NULL, 'Open', '2024-01-23 13:25:00'),
(7, 24, NULL, 17, 'We were charged twice for the same order.', NULL, 'Open', '2024-03-08 15:40:00'),
(8, 6, NULL, 11, 'I need to request a delivery date change for my pending order.', NULL, 'Open', '2024-04-11 09:30:00');