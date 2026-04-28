# Database Table Analysis

This document provides a detailed analysis of the database tables used in the E-Clothing Backend application.

---

## 1. Users Table
- **Table Name:** `Users`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the user.
    - `name` (String): Full name of the user.
    - `email` (String, Unique): Email address for login and notifications.
    - `phone` (String, Unique): Mobile number for communication and verification.
    - `password` (String): Hashed password for authentication.
    - `role` (Enum): User role (`user`, `admin`).
    - `isActive` (Boolean): Account status.
    - `profileImage` (String): URL to the user's profile picture.
    - `phoneVerified` (Boolean): Indicates if the phone number is verified.
    - `lastLogin` (Date): Timestamp of the last successful login.
    - `resetPasswordToken`, `resetPasswordExpire` (String/Date): For password recovery.
    - `deactivationReason`, `deactivatedAt` (String/Date): Details if the account is deactivated.
    - `createdAt`, `updatedAt` (Timestamps): Audit fields.
- **Purpose:** Manages user identity and authentication.
- **What is for:** Stores profile information, credentials, and access control levels for customers and administrators.

---

## 2. Addresses Table
- **Table Name:** `Addresses`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the address.
    - `userId` (UUID, FK): Reference to the user who owns the address.
    - `type` (Enum): Category (`home`, `work`, `other`).
    - `name` (String): Recipient's name.
    - `phone` (String): Recipient's contact number.
    - `addressLine1`, `addressLine2`, `landmark` (String): Physical location details.
    - `city`, `state`, `pincode`, `country` (String): Location metadata.
    - `isDefault`, `isBillingDefault`, `isShippingDefault` (Boolean): Flags for preference.
    - `latitude`, `longitude` (Float): Geographical coordinates for delivery tracking.
    - `instructions` (Text): Special delivery notes.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Stores multiple delivery and billing locations for users.
- **What is for:** Facilitates the checkout process by allowing users to select saved shipping and billing destinations.

---

## 3. Products Table
- **Table Name:** `Products`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the product.
    - `categoryId` (UUID, FK): Reference to the product category.
    - `name` (String): Product title.
    - `brand` (String): Manufacturer or brand name.
    - `description` (Text): Detailed product information.
    - `price` (Decimal): Base price of the product.
    - `discount` (Integer): Percentage discount applied.
    - `color` (String): Primary color of the item.
    - `size` (Enum): Available sizes (`XS` to `XXXL`).
    - `material` (String): Fabric or material type.
    - `stock` (Integer): Current inventory count.
    - `rating` (Float): Average user rating (0-5).
    - `numReviews` (Integer): Total count of reviews.
    - `isFeatured`, `isNew`, `isTrending` (Boolean): Flags for store highlights.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Central repository for all items available in the store.
- **What is for:** Provides data for the product catalog, search filters, and inventory management.

---

## 4. Categories Table
- **Table Name:** `Categories`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the category.
    - `name` (String, Unique): Category name (e.g., T-Shirts, Jeans).
    - `type` (Enum): Target audience (`men`, `women`, `kids`).
    - `description` (Text): Information about the category.
    - `image` (String): URL for the category banner/thumbnail.
    - `isActive` (Boolean): Visibility status on the storefront.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Organizes products into logical groups.
- **What is for:** Powering the navigation menu and allowing users to browse products by specific types or audiences.

---

## 5. ProductImages Table
- **Table Name:** `ProductImages`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the image record.
    - `productId` (UUID, FK): Reference to the associated product.
    - `url` (String): Cloudinary/Storage URL of the image.
    - `isPrimary` (Boolean): Indicates the main image to be shown in lists.
    - `order` (Integer): Display sequence for galleries.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Manages multiple visual assets for each product.
- **What is for:** Delivering high-quality visuals to the product detail pages and gallery views.

---

## 6. Carts Table
- **Table Name:** `Carts`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the cart item.
    - `userId` (UUID, FK): Reference to the user owning the cart.
    - `productId` (UUID, FK): Reference to the added product.
    - `quantity` (Integer): Number of units selected.
    - `size` (Enum): Selected size variant.
    - `color` (String): Selected color variant.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Temporarily holds items that a user intends to purchase.
- **What is for:** Managing the "Shopping Bag" functionality, allowing persistence of selected items across sessions.

---

## 7. Orders Table
- **Table Name:** `Orders`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the order.
    - `userId` (UUID, FK): Reference to the customer.
    - `couponId` (UUID, FK): Reference to any applied discount coupon.
    - `orderNumber` (String, Unique): Human-readable tracking ID.
    - `totalAmount` (Decimal): Sum of item prices before discounts.
    - `discountAmount` (Decimal): Total reduction from coupons/offers.
    - `finalAmount` (Decimal): Final price paid by the customer.
    - `status` (Enum): Fulfillment stage (`pending`, `confirmed`, `shipped`, `delivered`, etc.).
    - `paymentStatus` (Enum): Financial status (`pending`, `completed`, `failed`, `refunded`).
    - `paymentMethod` (Enum): Method used (`razorpay`, `cod`).
    - `shippingAddressSnapshot`, `billingAddressSnapshot` (JSONB): Point-in-time copy of address details.
    - `trackingNumber`, `carrier`, `trackingUrl` (String): Logistics information.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Records complete transaction and fulfillment data.
- **What is for:** Order history, tracking, revenue reporting, and post-purchase customer support.

---

## 8. OrderItems Table
- **Table Name:** `OrderItems`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the line item.
    - `orderId` (UUID, FK): Reference to the parent order.
    - `productId` (UUID, FK): Reference to the purchased product.
    - `quantity` (Integer): Number of units purchased.
    - `price` (Decimal): Unit price at the time of purchase.
    - `size`, `color` (String): Selected variants.
    - `productName`, `productImage` (String): Snapshots of product details for historical accuracy.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Breaks down orders into individual product components.
- **What is for:** Detailed invoicing, inventory deduction, and specific item tracking within a large order.

---

## 9. Coupons Table
- **Table Name:** `Coupons`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the coupon.
    - `code` (String, Unique): The alphanumeric string users enter (e.g., SAVE20).
    - `discountType` (Enum): Calculation method (`percentage`, `fixed`).
    - `discountValue` (Decimal): Value of the discount.
    - `minOrderValue`, `maxDiscount` (Decimal): Usage constraints.
    - `startDate`, `endDate` (Date): Validity period.
    - `usageLimit`, `usedCount` (Integer): Frequency controls.
    - `isActive`, `isPublic` (Boolean): Availability flags.
    - `applicableCategories`, `applicableProducts` (Arrays): Target scope for the discount.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Manages promotional offers and discounts.
- **What is for:** Marketing campaigns and customer retention by providing price incentives.

---

## 10. Reviews Table
- **Table Name:** `Reviews`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the review.
    - `userId` (UUID, FK): Reference to the reviewer.
    - `productId` (UUID, FK): Reference to the product being reviewed.
    - `rating` (Integer): User score (1-5).
    - `title`, `comment` (String/Text): Written feedback.
    - `isVerifiedPurchase` (Boolean): Authenticity flag.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Captures customer feedback and sentiment.
- **What is for:** Building trust through social proof and providing insights for product improvement.

---

## 11. Wishlists Table
- **Table Name:** `Wishlists`
- **Fields:**
    - `id` (UUID, PK): Unique identifier for the wishlist entry.
    - `userId` (UUID, FK): Reference to the user.
    - `productId` (UUID, FK): Reference to the saved product.
    - `notes` (Text): Personal user notes about the item.
    - `priority` (Enum): `low`, `medium`, `high`.
    - `reminderPrice` (Decimal): Target price for notifications.
    - `isReminderActive` (Boolean): Toggle for price alerts.
    - `createdAt`, `updatedAt` (Timestamps).
- **Purpose:** Allows users to save products for future consideration.
- **What is for:** Personalizing the shopping experience and driving future sales through price-drop notifications.
