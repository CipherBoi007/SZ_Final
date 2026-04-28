# SZ Backend — Complete API Documentation (Postman)

**Base URL**: `http://localhost:5000/api`  
**Auth**: Most endpoints require `Authorization: Bearer <ACCESS_TOKEN>` header.  
**Token Strategy**: Access Token (15 min) + Refresh Token (30 days, HttpOnly Cookie + body).

---

## 1. AUTH — `/api/auth`

### 1.1 Register
| | |
|---|---|
| **URL** | `POST /api/auth/register` |
| **Auth** | ❌ Public |

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password@123"
}
```
**Response** `201`: `{ token, refreshToken, data: { user } }`

---

### 1.2 Login
| | |
|---|---|
| **URL** | `POST /api/auth/login` |
| **Auth** | ❌ Public |

```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```
**Response** `200`: `{ token, refreshToken, data: { user } }`

---

### 1.3 Refresh Token
| | |
|---|---|
| **URL** | `POST /api/auth/refresh-token` |
| **Auth** | ❌ Public (uses refresh token) |

```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
}
```
**Response** `200`: `{ token, refreshToken }` — rotated pair.

---

### 1.4 Logout
| | |
|---|---|
| **URL** | `POST /api/auth/logout` |
| **Auth** | ✅ Bearer Token |

**Response** `200`: Clears refresh token from DB & cookie.

---

### 1.5 Update Password
| | |
|---|---|
| **URL** | `PATCH /api/auth/update-password` |
| **Auth** | ✅ Bearer Token |

```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPass@456"
}
```

---

### 1.6 Forgot Password
| | |
|---|---|
| **URL** | `POST /api/auth/forgot-password` |
| **Auth** | ❌ Public |

```json
{ "email": "john@example.com" }
```

---

### 1.7 Reset Password
| | |
|---|---|
| **URL** | `POST /api/auth/reset-password/:token` |
| **Auth** | ❌ Public |

```json
{ "password": "NewSecure@789" }
```

---

## 2. USERS — `/api/users` (All require Bearer Token)

### 2.1 Get Profile
| | |
|---|---|
| **URL** | `GET /api/users/profile` |

### 2.2 Update Profile
| | |
|---|---|
| **URL** | `PATCH /api/users/profile` |

```json
{ "name": "John Updated", "phone": "9999999999" }
```

### 2.3 Upload Profile Picture
| | |
|---|---|
| **URL** | `POST /api/users/profile/picture` |
| **Body** | `form-data` — key: `profile`, value: image file |

### 2.4 Delete Profile Picture
| | |
|---|---|
| **URL** | `DELETE /api/users/profile/picture` |

### 2.5 Change Password
| | |
|---|---|
| **URL** | `POST /api/users/change-password` |

```json
{ "currentPassword": "Password@123", "newPassword": "Updated@456" }
```

### 2.6 Deactivate Account
| | |
|---|---|
| **URL** | `POST /api/users/deactivate` |

### 2.7 Get My Orders
| | |
|---|---|
| **URL** | `GET /api/users/orders` |

### 2.8 Get Single Order
| | |
|---|---|
| **URL** | `GET /api/users/orders/:id` |

### 2.9 Cancel Order
| | |
|---|---|
| **URL** | `POST /api/users/orders/:id/cancel` |

### 2.10 Get My Wishlist
| | |
|---|---|
| **URL** | `GET /api/users/wishlist` |

### 2.11 Get My Reviews
| | |
|---|---|
| **URL** | `GET /api/users/reviews` |

### 2.12 Get User Stats
| | |
|---|---|
| **URL** | `GET /api/users/stats` |

---

## 3. PRODUCTS — `/api/products`

### 3.1 Get All Products (Public)
| | |
|---|---|
| **URL** | `GET /api/products` |
| **Query** | `?page=1&limit=10&sort=-createdAt&search=hoodie&price[gte]=500` |

### 3.2 Get Featured Products (Public)
| | |
|---|---|
| **URL** | `GET /api/products/featured` |

### 3.3 Get New Arrivals (Public)
| | |
|---|---|
| **URL** | `GET /api/products/new-arrivals` |

### 3.4 Get Trending Products (Public)
| | |
|---|---|
| **URL** | `GET /api/products/trending` |

### 3.5 Search Products (Public)
| | |
|---|---|
| **URL** | `GET /api/products/search?q=tshirt` |

### 3.6 Get Products by Category (Public)
| | |
|---|---|
| **URL** | `GET /api/products/category/:categoryId` |

### 3.7 Get Single Product (Public)
| | |
|---|---|
| **URL** | `GET /api/products/:id` |

### 3.8 Add Product Review (Auth)
| | |
|---|---|
| **URL** | `POST /api/products/:id/reviews` |
| **Auth** | ✅ Bearer Token |

```json
{ "rating": 5, "title": "Amazing quality", "comment": "Best hoodie ever" }
```

### 3.9 Create Product (Admin)
| | |
|---|---|
| **URL** | `POST /api/products` |
| **Auth** | ✅ Admin |
| **Body** | `form-data` or `JSON` |

```json
{
  "name": "Oversized Graphic Tee",
  "brand": "SZ Essentials",
  "description": "Premium cotton oversized t-shirt",
  "categoryId": "CATEGORY_UUID",
  "material": "Cotton",
  "isFeatured": true,
  "variants": [
    { "size": "M", "color": "Black", "price": 899, "stock": 50, "sku": "TEE-BLK-M" },
    { "size": "L", "color": "Black", "price": 899, "stock": 40, "sku": "TEE-BLK-L" },
    { "size": "M", "color": "White", "price": 899, "stock": 30, "sku": "TEE-WHT-M" }
  ]
}
```

### 3.10 Update Product (Admin)
| | |
|---|---|
| **URL** | `PATCH /api/products/:id` |
| **Auth** | ✅ Admin |

```json
{ "name": "Updated Name", "isTrending": true }
```

### 3.11 Delete Product (Admin)
| | |
|---|---|
| **URL** | `DELETE /api/products/:id` |
| **Auth** | ✅ Admin |

### 3.12 Update Stock (Admin)
| | |
|---|---|
| **URL** | `PATCH /api/products/:id/stock` |
| **Auth** | ✅ Admin |

```json
{ "stock": 100 }
```

### 3.13 Delete Product Image (Admin)
| | |
|---|---|
| **URL** | `DELETE /api/products/:productId/images/:imageId` |
| **Auth** | ✅ Admin |

### 3.14 Set Primary Image (Admin)
| | |
|---|---|
| **URL** | `PATCH /api/products/:productId/images/:imageId/primary` |
| **Auth** | ✅ Admin |

---

## 4. CART — `/api/cart` (All require Bearer Token)

### 4.1 Get Cart
| | |
|---|---|
| **URL** | `GET /api/cart` |

### 4.2 Add to Cart
| | |
|---|---|
| **URL** | `POST /api/cart` |

```json
{ "variantId": "VARIANT_UUID", "quantity": 2 }
```

### 4.3 Update Cart Item Quantity
| | |
|---|---|
| **URL** | `PATCH /api/cart/:cartItemId` |

```json
{ "quantity": 3 }
```

### 4.4 Remove Cart Item
| | |
|---|---|
| **URL** | `DELETE /api/cart/:cartItemId` |

### 4.5 Clear Entire Cart
| | |
|---|---|
| **URL** | `DELETE /api/cart` |

---

## 5. ORDERS — `/api/orders` (All require Bearer Token)

### 5.1 Create Order (from cart)
| | |
|---|---|
| **URL** | `POST /api/orders` |

```json
{
  "shippingAddressId": "ADDRESS_UUID",
  "paymentMethod": "cod"
}
```

### 5.2 Create Order (direct buy)
| | |
|---|---|
| **URL** | `POST /api/orders` |

```json
{
  "shippingAddressId": "ADDRESS_UUID",
  "paymentMethod": "cod",
  "directBuy": true,
  "items": [
    { "variantId": "VARIANT_UUID", "quantity": 1 }
  ]
}
```

### 5.3 Get My Orders
| | |
|---|---|
| **URL** | `GET /api/orders` |

### 5.4 Get Single Order
| | |
|---|---|
| **URL** | `GET /api/orders/:id` |

### 5.5 Cancel Order
| | |
|---|---|
| **URL** | `POST /api/orders/:id/cancel` |

### 5.6 Track Order
| | |
|---|---|
| **URL** | `GET /api/orders/:id/track` |

### 5.7 Request Return
| | |
|---|---|
| **URL** | `POST /api/orders/:id/return` |

### 5.8 Reorder
| | |
|---|---|
| **URL** | `POST /api/orders/:id/reorder` |

### 5.9 Get Invoice
| | |
|---|---|
| **URL** | `GET /api/orders/:id/invoice` |

### 5.10 Verify Payment (Razorpay)
| | |
|---|---|
| **URL** | `POST /api/orders/verify-payment` |

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx"
}
```

---

## 6. ADDRESSES — `/api/addresses`

### 6.1 Validate Pincode (Public)
| | |
|---|---|
| **URL** | `GET /api/addresses/validate-pincode/400001` |

### 6.2 Get All Addresses (Auth)
| | |
|---|---|
| **URL** | `GET /api/addresses` |

### 6.3 Get Default Addresses (Auth)
| | |
|---|---|
| **URL** | `GET /api/addresses/defaults` |

### 6.4 Create Address (Auth)
| | |
|---|---|
| **URL** | `POST /api/addresses` |

```json
{
  "type": "home",
  "name": "John's Home",
  "phone": "9876543210",
  "addressLine1": "123 MG Road",
  "addressLine2": "Apt 4B",
  "landmark": "Near Central Mall",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "isDefault": true
}
```

### 6.5 Get Single Address (Auth)
| | |
|---|---|
| **URL** | `GET /api/addresses/:id` |

### 6.6 Update Address (Auth)
| | |
|---|---|
| **URL** | `PATCH /api/addresses/:id` |

```json
{ "addressLine1": "456 New Road", "city": "Pune" }
```

### 6.7 Delete Address (Auth)
| | |
|---|---|
| **URL** | `DELETE /api/addresses/:id` |

### 6.8 Set Default Address (Auth)
| | |
|---|---|
| **URL** | `PATCH /api/addresses/:id/default` |

### 6.9 Get Pincode Details (Auth)
| | |
|---|---|
| **URL** | `GET /api/addresses/pincode/400001` |

---

## 7. WISHLIST — `/api/wishlist` (All require Bearer Token)

### 7.1 Get Wishlist
| | |
|---|---|
| **URL** | `GET /api/wishlist` |

### 7.2 Get Wishlist Count
| | |
|---|---|
| **URL** | `GET /api/wishlist/count` |

### 7.3 Add to Wishlist
| | |
|---|---|
| **URL** | `POST /api/wishlist/product/:productId` |

### 7.4 Check Wishlist Status
| | |
|---|---|
| **URL** | `GET /api/wishlist/product/:productId/status` |

### 7.5 Remove from Wishlist
| | |
|---|---|
| **URL** | `DELETE /api/wishlist/item/:id` |

### 7.6 Move to Cart
| | |
|---|---|
| **URL** | `POST /api/wishlist/item/:id/move-to-cart` |

```json
{ "variantId": "VARIANT_UUID" }
```

### 7.7 Clear Wishlist
| | |
|---|---|
| **URL** | `DELETE /api/wishlist/clear` |

---

## 8. COUPONS — `/api/coupons`

### 8.1 Get All Coupons (Auth)
| | |
|---|---|
| **URL** | `GET /api/coupons` |

### 8.2 Validate Coupon (Auth)
| | |
|---|---|
| **URL** | `GET /api/coupons/validate/WELCOME20?orderAmount=1500` |

### 8.3 Get Single Coupon (Auth)
| | |
|---|---|
| **URL** | `GET /api/coupons/:id` |

### 8.4 Create Coupon (Admin)
| | |
|---|---|
| **URL** | `POST /api/coupons` |
| **Auth** | ✅ Admin |

```json
{
  "code": "SUMMER25",
  "description": "25% off summer collection",
  "discountType": "percentage",
  "discountValue": 25,
  "minOrderValue": 999,
  "maxDiscount": 500,
  "usageLimit": 100,
  "startDate": "2026-05-01",
  "endDate": "2026-06-30",
  "isPublic": true,
  "isActive": true
}
```

### 8.5 Update Coupon (Admin)
| | |
|---|---|
| **URL** | `PATCH /api/coupons/:id` |
| **Auth** | ✅ Admin |

### 8.6 Delete Coupon (Admin)
| | |
|---|---|
| **URL** | `DELETE /api/coupons/:id` |
| **Auth** | ✅ Admin |

---

## 9. ADMIN — `/api/admin` (All require Admin Bearer Token)

### 9.1 Dashboard Stats
| | |
|---|---|
| **URL** | `GET /api/admin/dashboard` |

### 9.2 Get All Users
| | |
|---|---|
| **URL** | `GET /api/admin/users` |

### 9.3 Get Single User
| | |
|---|---|
| **URL** | `GET /api/admin/users/:id` |

### 9.4 Update User
| | |
|---|---|
| **URL** | `PATCH /api/admin/users/:id` |

```json
{ "name": "Admin Updated Name" }
```

### 9.5 Promote to Admin
| | |
|---|---|
| **URL** | `POST /api/admin/users/:id/promote` |

### 9.6 Deactivate User
| | |
|---|---|
| **URL** | `POST /api/admin/users/:id/deactivate` |

### 9.7 Get All Orders
| | |
|---|---|
| **URL** | `GET /api/admin/orders` |

### 9.8 Update Order Status
| | |
|---|---|
| **URL** | `PATCH /api/admin/orders/:id/status` |

```json
{ "status": "shipped", "trackingNumber": "TRK123456", "carrier": "Delhivery" }
```

### 9.9 Update Delivery Date
| | |
|---|---|
| **URL** | `PATCH /api/admin/orders/:id/delivery-date` |

```json
{ "deliveryDate": "2026-05-03" }
```

### 9.10 Get All Categories
| | |
|---|---|
| **URL** | `GET /api/admin/categories` |

### 9.11 Create Category
| | |
|---|---|
| **URL** | `POST /api/admin/categories` |

```json
{ "name": "Hoodies", "parentId": "PARENT_CATEGORY_UUID" }
```

### 9.12 Update Category
| | |
|---|---|
| **URL** | `PATCH /api/admin/categories/:id` |

```json
{ "name": "Premium Hoodies" }
```

### 9.13 Delete Category
| | |
|---|---|
| **URL** | `DELETE /api/admin/categories/:id` |

---

## 10. WHATSAPP — `/api/whatsapp`

### 10.1 Send OTP (Public, Rate-limited)
| | |
|---|---|
| **URL** | `POST /api/whatsapp/send-otp` |

```json
{ "phone": "9876543210" }
```

### 10.2 Verify OTP (Public, Rate-limited)
| | |
|---|---|
| **URL** | `POST /api/whatsapp/verify-otp` |

```json
{ "phone": "9876543210", "otp": "123456" }
```

### 10.3 Get Verification Status (Auth)
| | |
|---|---|
| **URL** | `GET /api/whatsapp/status` |

---

## 11. CONFIG — `/api/config`

### 11.1 Get All Categories (Public)
| | |
|---|---|
| **URL** | `GET /api/config/categories` |

---

## 12. HEALTH CHECK

### 12.1 Health
| | |
|---|---|
| **URL** | `GET /health` |
| **Auth** | ❌ Public |

---

## Postman Setup Tips

1. **Environment Variables**: Create a Postman environment with:
   - `BASE_URL` = `http://localhost:5000/api`
   - `ACCESS_TOKEN` = (auto-set from login response)
   - `REFRESH_TOKEN` = (auto-set from login response)

2. **Auto-set token on login**: In the Login request's **Tests** tab, add:
   ```javascript
   const res = pm.response.json();
   pm.environment.set("ACCESS_TOKEN", res.token);
   pm.environment.set("REFRESH_TOKEN", res.refreshToken);
   ```

3. **Auth header**: Set `Authorization: Bearer {{ACCESS_TOKEN}}` in the collection-level auth.

---

## Total Endpoints: **58**

| Module | Count |
|--------|-------|
| Auth | 7 |
| Users | 12 |
| Products | 14 |
| Cart | 5 |
| Orders | 10 |
| Addresses | 9 |
| Wishlist | 7 |
| Coupons | 6 |
| Admin | 13 |
| WhatsApp | 3 |
| Config | 1 |
| Health | 1 |
