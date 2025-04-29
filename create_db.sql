
CREATE TABLE People (
    PersonID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    StreetAddress VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    State ENUM('AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN',
                'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV',
                'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
                'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY') NOT NULL,
    ZipCode VARCHAR(10) NOT NULL
) ENGINE InnoDB;

CREATE TABLE Customers (
    PersonID INT PRIMARY KEY,
    CustomerType ENUM('Individual', 'Company') NOT NULL,
    FOREIGN KEY (PersonID) REFERENCES People(PersonID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IndividualCustomers (
    PersonID INT PRIMARY KEY,
    FOREIGN KEY (PersonID) REFERENCES Customers(PersonID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE CompanyCustomers (
    PersonID INT PRIMARY KEY,
    CompanyName VARCHAR(255) NOT NULL,
    TaxID VARCHAR(50) NOT NULL,
    FOREIGN KEY (PersonID) REFERENCES Customers(PersonID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Employees (
    PersonID INT PRIMARY KEY,
    Role ENUM('Manager', 'Sales') NOT NULL,
    HireDate DATE NOT NULL,
    TerminationDate DATE NULL,
    Password VARCHAR(255) NOT NULL,
    FOREIGN KEY (PersonID) REFERENCES People(PersonID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    Brand VARCHAR(255) NOT NULL,
    Category ENUM('Electronics', 'Clothing', 'Furniture', 'Food') NOT NULL,
    Size INT NOT NULL,
    SizeUnit ENUM('cm', 'm', 'kg', 'lb') NOT NULL,
    StockQuantity INT NOT NULL,
    UNIQUE(ProductName, Brand),
    StorageRequirement ENUM('Cold Storage', 'Dry Storage', 'Frozen Storage') NOT NULL
) ENGINE InnoDB;

CREATE TABLE Orders (
    InvoiceNumber INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    OrderDate DATE NOT NULL,
    InvoiceDate DATE NULL,
    PaymentStatus ENUM('Pending', 'Paid', 'Overdue') NOT NULL,
    Status ENUM('Pending', 'PickedUp', 'Cancelled') NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customers(PersonID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE InnoDB;

CREATE TABLE OrderDetails (
    InvoiceNumber INT,
    ProductID INT,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (InvoiceNumber, ProductID),
    FOREIGN KEY (InvoiceNumber) REFERENCES Orders(InvoiceNumber) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Pickups (
    OrderID INT NOT NULL,
    ScheduledDate DATE NOT NULL,
    ScheduledByEmployeeID INT NOT NULL,
    PickedUpByCustomerID INT NOT NULL,
    Status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL,
    PRIMARY KEY (OrderID, ScheduledDate),
    FOREIGN KEY (OrderID) REFERENCES Orders(InvoiceNumber) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ScheduledByEmployeeID) REFERENCES Employees(PersonID) ON UPDATE CASCADE,
    FOREIGN KEY (PickedUpByCustomerID) REFERENCES Customers(PersonID) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Complaints (
    ComplaintID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    EmployeeID INT NULL,
    OrderID INT NULL,
    ComplaintText TEXT NOT NULL,
    ResolveText TEXT NULL,
    Status ENUM('Open', 'In Progress', 'Resolved') NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customers(PersonID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employees(PersonID) ON UPDATE CASCADE,
    FOREIGN KEY (OrderID) REFERENCES Orders(InvoiceNumber) ON UPDATE CASCADE
)  ENGINE InnoDB;
