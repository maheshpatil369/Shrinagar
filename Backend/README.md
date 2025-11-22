Postman Guide: Testing the Shringar Jewelry API
This guide will walk you through testing the core functionality of your backend API using Postman. We will simulate the user journeys for a customer, a new seller, and an administrator.

Step 1: User Registration and Login (/api/auth)
This is the starting point for all users.

A. Register a new Customer
Method: POST

URL: http://localhost:8000/api/auth/register

Headers:

Content-Type: application/json

Body: Select raw and JSON.

{
"name": "Test Customer",
"email": "customer@example.com",
"password": "password123"
}

Action: Click Send.

Expected Result: You should get a 201 Created status and a JSON response with the new user's details and a JWT token.

B. Register a new Seller
Method: POST

URL: http://localhost:8000/api/auth/register

Body: Select raw and JSON. Notice the added "role": "seller".

{
"name": "Test Seller",
"email": "seller@example.com",
"password": "password123",
"role": "seller"
}

Action: Click Send.

Expected Result: A 201 Created status with the new seller's user account.

C. Log In as the Seller
Method: POST

URL: http://localhost:8000/api/auth/login

Body: Select raw and JSON.

{
"email": "seller@example.com",
"password": "password123"
}

Action: Click Send.

Expected Result: A 200 OK status with the user's details and a JWT token.

IMPORTANT: From the JSON response body, copy the token value. You will need this for all protected routes.

Step 2: Seller Application (/api/sellers)
Now that the seller is logged in, they need to submit their business profile.

Method: POST

URL: http://localhost:8000/api/sellers/profile

Headers:

Content-Type: application/json

Authorization: Bearer <PASTE_YOUR_SELLER_TOKEN_HERE>

Body: Select raw and JSON.

{
"businessName": "Elegant Gems",
"gstNumber": "22ABCDE1234F1Z5",
"panNumber": "ABCDE1234F",
"address": {
"street": "123 Diamond Lane",
"city": "Jaipur",
"state": "Rajasthan",
"pincode": "302001"
}
}

Action: Click Send.

Expected Result: A 201 Created status with the new seller profile. Note that the status will be "pending".

Step 3: Creating an Admin User (Manual Step)
Since there is no admin registration endpoint, you need to manually promote a user to admin for testing purposes.

Register a new user in Postman as you did in Step 1A (e.g., admin@example.com).

Open your MongoDB Atlas dashboard and navigate to your shringar database and then the users collection.

Find the admin user you just created.

Edit the document and change the role field from "customer" to "admin".

Save the document.

Now, log in as the admin user in Postman to get an Admin Token. You'll need this for the next steps.

Step 4: Product and Seller Approval (Admin)
A. Approve the Seller Application
Get Seller ID: In MongoDB, find the sellers collection and copy the _id of the "Elegant Gems" seller you created in Step 2.

Method: PUT

URL: http://localhost:8000/api/sellers/approve/<PASTE_SELLER_ID_HERE>

Headers:

Authorization: Bearer <PASTE_YOUR_ADMIN_TOKEN_HERE>

Action: Click Send.

Expected Result: A 200 OK status with the seller's profile, now showing status: "approved".

B. Create a Product (as the now-approved Seller)
Log in again as the seller (seller@example.com) to get their token.

Method: POST

URL: http://localhost:8000/api/products

Headers:

Content-Type: application/json

Authorization: Bearer <PASTE_APPROVED_SELLER_TOKEN_HERE>

Body: Select raw and JSON.

{
"name": "Classic Gold Bangle",
"description": "A timeless 22k gold bangle.",
"category": "Bracelets",
"material": "Gold",
"affiliateUrl": "https://example.com/bangle-123"
}

Action: Click Send.

Expected Result: 201 Created status with the new product details. The product's status will be "pending".

C. Approve the New Product (as Admin)
Get Product ID: Copy the _id from the product you just created.

Method: PUT

URL: http://localhost:8000/api/products/approve/<PASTE_PRODUCT_ID_HERE>

Headers:

Authorization: Bearer <PASTE_YOUR_ADMIN_TOKEN_HERE>

Action: Click Send.

Expected Result: A 200 OK status with the product details, now showing status: "approved".

Step 5: Public Endpoints
These routes don't require a token.

A. Get all approved products
Method: GET

URL: http://localhost:8000/api/products

Action: Click Send.

Expected Result: 200 OK status and an array containing the "Classic Gold Bangle" you just approved.

This workflow confirms that your entire backend—from user roles and authentication to product and seller lifecycles—is working correctly.

💍 Shringar Jewelry Marketplace – Backend API

Welcome to the Shringar Jewelry Marketplace Backend API.
This document provides an overview of the API's architecture, data models, and endpoints, along with a guide for testing the complete user workflow.

📑 Table of Contents

Core Concepts

User Roles

Data Workflow

Authentication

API Endpoints

Public Routes

Customer Routes

Seller Routes

Admin Routes

Testing Workflow Guide

💡 Core Concepts

User Roles

The platform has three distinct user roles:

👤 Customer – Default role for any new user. Can browse approved products, view details, and manage a wishlist.

🛍 Seller – Must register and be approved by an Admin. Once approved, can create/manage products (also require Admin approval).

🛠 Admin – Full control over the platform. Approves sellers, products, and manages users.

Data Workflow

The system uses a multi-step approval process for quality control.

Seller Registration → User registers, seller profile created with status: "pending".

Admin Approval (Seller) → Admin reviews & approves seller (status: "approved").

Product Creation → Approved seller creates a product (status: "pending").

Admin Approval (Product) → Admin approves product (status: "approved").

Public Visibility → Only approved products are shown to customers.

🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

Include your token in headers for all protected routes:

Authorization: Bearer <YOUR_JWT_TOKEN>


Login → POST /api/auth/login returns a JWT.

📡 API Endpoints

Public Routes (No Auth Required)

Method

Endpoint

Description

POST

/api/auth/register

Register a new customer.

POST

/api/sellers/register

Register a new seller + profile (pending).

POST

/api/auth/login

Log in & get JWT.

GET

/api/products

Get all approved products.

GET

/api/products/:id

Get single approved product.

Customer Routes (JWT Required)

Method

Endpoint

Description

GET

/api/auth/me

Get current user profile.

GET

/api/users/wishlist

Get wishlist.

POST

/api/users/wishlist

Add product to wishlist.

DELETE

/api/users/wishlist/:productId

Remove product from wishlist.

Seller Routes (Seller JWT Required)

Method

Endpoint

Description

POST

/api/products

Create a new product (pending).

PUT

/api/products/:id

Update seller’s own product.

GET

/api/sellers/dashboard

Seller dashboard data.

Admin Routes (Admin JWT Required)

Method

Endpoint

Description

GET

/api/sellers

List all sellers.

PUT

/api/sellers/:userId/approve

Approve a seller.

PUT

/api/sellers/:userId/suspend

Suspend a seller.

PUT

/api/products/:id

Update product (incl. status).

DELETE

/api/products/:id

Delete product.

GET

/api/users

List all users.

DELETE

/api/users/:id

Delete user + related data.

🧪 Testing Workflow Guide

Follow these steps in Postman to test full flow:

1️⃣ Register a Seller

POST /api/sellers/register
Content-Type: application/json

{
  "name": "Diamond Crafts",
  "email": "seller@example.com",
  "password": "securePass123",
  "businessName": "Diamond Crafts Pvt Ltd"
}


Response → Seller created with status: "pending"

2️⃣ Create & Promote Admin

POST /api/auth/register


Then manually set role: "admin" in MongoDB.

3️⃣ Login & Get JWT

POST /api/auth/login


Copy tokens for both Seller & Admin.

4️⃣ Approve Seller (Admin)

PUT /api/sellers/<SELLER_USER_ID>/approve
Authorization: Bearer <ADMIN_JWT>


5️⃣ Create Product (Seller)

POST /api/products
Authorization: Bearer <SELLER_JWT>
Content-Type: application/json

{
  "name": "Gold Necklace",
  "description": "24k pure gold necklace",
  "category": "Necklaces"
}


Product created with status: "pending"

6️⃣ Approve Product (Admin)

PUT /api/products/<PRODUCT_ID>
Authorization: Bearer <ADMIN_JWT>
Content-Type: application/json

{ "status": "approved" }


7️⃣ Customer Flow

POST /api/auth/register   // Register as Customer
POST /api/auth/login      // Login as Customer
GET  /api/products        // Fetch approved products
POST /api/users/wishlist  // Add product to wishlist


✅ Summary

Customers → Browse & wishlist approved products.

Sellers → Register → Wait for admin approval → Add products.

Admins → Approve sellers & products → Manage marketplace.

🚀 You’re now ready to use the Shringar Jewelry Marketplace 