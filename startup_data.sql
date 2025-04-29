-- startup_data.sql
-- Initial data for day zero operations

-- Adding basic employees (2 managers, 2 sales staff)
INSERT INTO People (PersonID, FirstName, LastName, Email, PhoneNumber, StreetAddress, City, State, ZipCode)
VALUES 
(1, 'Sarah', 'Johnson', 'sarah.johnson@company.com', '555-123-4567', '123 Main Street', 'Springfield', 'IL', '62701'),
(2, 'Michael', 'Chen', 'michael.chen@company.com', '555-234-5678', '456 Oak Avenue', 'Springfield', 'IL', '62702'),
(3, 'David', 'Rodriguez', 'david.rodriguez@company.com', '555-345-6789', '789 Elm Street', 'Springfield', 'IL', '62704'),
(4, 'Emily', 'Williams', 'emily.williams@company.com', '555-456-7890', '321 Pine Road', 'Springfield', 'IL', '62703'),
(5, 'Shawty', 'Bones', 'shawty.bones@company.com', '555-214-9876', '123 Main St', 'New York', 'NY', '10001'),
(1000000002, 'Michael', 'Smith', 'michael.smith@company.com', '555-347-1234', '456 Oak Ave', 'Los Angeles', 'CA', '90001'),
(1000000003, 'Sarah', 'Davis', 'sarah.davis@company.com', '555-852-4637', '789 Pine Rd', 'Chicago', 'IL', '60601'),
(1000000004, 'David', 'Wilson', 'david.wilson@company.com', '555-951-3578', '320 Elm Ln', 'Houston', 'TX', '77001'),
(1000000005, 'Laura', 'Brown', 'laura.brown@company.com', '555-624-8899', '654 Maple Dr', 'Phoenix', 'AZ', '85001'),
(1000000006, 'Lebron', 'James', 'bronnybron@company.com', '555-322-4104', '987 Cedar Ct', 'Philadelphia', 'PA', '19101'),
(1000000007, 'Calvin', 'Klien', 'underwear@company.com', '555-955-3512', '122 Spruce Ln', 'Houston', 'TX', '77001'),
(1000000008, 'Big', 'Dog', 'bigdogn@company.com', '555-634-8804', '234 Maple Dr', 'Phoenix', 'AZ', '85001'),
(1000000009, 'Sabrina', 'Carpenter', 'sabbyp@company.com', '555-371-4642', '71 Cedar Ct', 'Philadelphia', 'PA', '19101');


INSERT INTO Employees (PersonID, Role, HireDate, TerminationDate, Password)
VALUES 
(1, 'Manager', '2023-01-15', NULL, 'password'), 
(2, 'Manager', '2023-03-10', NULL, 'password'), 
(3, 'Sales', '2023-06-05', NULL, 'password'), 
(4, 'Sales', '2023-08-20', NULL, 'password'),
(5, 'Manager', '2018-03-15', NULL, 'hashed_password_123'),
(1000000002, 'Sales', '2020-06-22', '2022-08-15', 'securePass!234'),
(1000000003, 'Sales', '2019-11-05', NULL, 'p@ssw0rdIT'),
(1000000004, 'Sales', '2021-02-14', NULL, 'HR_secure_456'),
(1000000005, 'Sales', '2017-09-30', '2023-01-10', 'm@rketing_789'),
(1000000006, 'Sales', '2021-03-28', NULL, 'supportPass1'),
(1000000007, 'Manager', '2008-08-05', NULL, 'supportPass1'),
(1000000008, 'Sales', '2018-12-06', NULL, 'supportPass1'),
(1000000009, 'Sales', '2023-02-1', NULL, 'supportPass1');


-- Adding initial products inventory
INSERT INTO Products (ProductID, ProductName, Brand, Category, Size, SizeUnit, StockQuantity, StorageRequirement)
VALUES 
(1, 'Ultra HD Smart TV 55"', 'TechVision', 'Electronics', 55, 'cm', 25, 'Dry Storage'),
(2, 'Ultra HD Smart TV 65"', 'TechVision', 'Electronics', 65, 'cm', 15, 'Dry Storage'),
(3, 'Premium Laptop Pro', 'ByteBook', 'Electronics', 15, 'cm', 30, 'Dry Storage'),
(4, 'Wireless Noise-Cancelling Headphones', 'SoundWave', 'Electronics', 20, 'cm', 40, 'Dry Storage'),
(5, 'Classic Denim Jeans', 'UrbanStyle', 'Clothing', 32, 'cm', 50, 'Dry Storage'),
(6, 'Premium Cotton T-Shirt', 'UrbanStyle', 'Clothing', 42, 'cm', 100, 'Dry Storage'),
(7, 'Ergonomic Office Chair', 'ComfortPlus', 'Furniture', 110, 'cm', 20, 'Dry Storage'),
(8, 'Modern Coffee Table', 'HomeLuxe', 'Furniture', 120, 'cm', 15, 'Dry Storage'),
(9, 'Sectional Sofa', 'ComfortPlus', 'Furniture', 250, 'cm', 10, 'Dry Storage'),
(10, 'Organic Granola', 'NatureHarvest', 'Food', 500, 'g', 60, 'Dry Storage'),
(11, 'Premium Coffee Beans', 'BeanMaster', 'Food', 1, 'kg', 75, 'Dry Storage'),
(12, 'Frozen Mixed Berries', 'FreshFarms', 'Food', 2, 'kg', 40, 'Frozen Storage'),
(13, 'Artisanal Cheese Selection', 'DairyDelights', 'Food', 500, 'g', 30, 'Cold Storage');

-- Add Shawty Bones as a customer (to resolve the reference in fake-data-sql.sql)
INSERT INTO Customers (PersonID, CustomerType)
VALUES (5, 'Individual');

INSERT INTO IndividualCustomers (PersonID)
VALUES (5);