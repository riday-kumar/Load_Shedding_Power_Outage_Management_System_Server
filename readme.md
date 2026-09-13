# ⚡ Load Shedding & Power Management System

A robust backend REST API for managing electricity generation, power distribution, load shedding schedules, emergency outages, technicians, customer complaints, subscriptions, and payments.

The system is designed around a hierarchical power-management workflow:

## **Power Authority → Distributor → Substation → Feeder → Area → Customer**

### Project Links

- Backend API: https://load-shedding-power-outage-manageme-tau.vercel.app/

---

## 📌 Project Overview

The **Load Shedding & Power Management System** helps power authorities and distribution companies efficiently manage electricity supply and outages.

The system allows authorized users to:

- Monitor national power generation and demand
- Allocate available power to distribution companies
- Manage substations and feeders
- Create and manage load-shedding schedules
- Handle unexpected/emergency power outages
- Assign technicians to outage-related problems
- Notify customers about scheduled and unexpected outages
- Receive customer complaints/reports
- Manage customer subscriptions and payments

---

## 👥 User Roles

The system contains **six different roles**, each with specific responsibilities.

### 1. Admin

The Admin manages the overall system.

**Responsibilities:**

- Manage system-level users
- Create Power Authority users
- Monitor overall system activities
- Manage administrative operations

### 2. Power Authority

The Power Authority manages national-level power information.

**Responsibilities:**

- Record national power generation
- Monitor electricity demand
- Allocate available power among distributors
- Monitor overall power distribution

### 3. Distributor Manager

The Distributor Manager manages a specific power distribution company.

**Responsibilities:**

- Manage substations
- Manage feeders
- Manage power operators
- Manage technicians
- Monitor power distribution within the distributor's area
- Approve or reject load-shedding schedules

### 4. Power Operator

The Power Operator manages operational power activities.

**Responsibilities:**

- Create load-shedding schedules
- Manage feeder-level power operations
- Report emergency outages
- Assign technicians when required
- Monitor outage status

### 5. Technician

The Technician handles field-level power problems.

**Responsibilities:**

- Receive assigned outage/repair tasks
- Investigate power problems
- Perform necessary repairs
- Update repair status
- Report restoration of power

### 6. Customer

The Customer uses the system to access power-related services.

**Responsibilities:**

- Register and log in
- View power-related information
- Receive outage notifications
- Report power problems
- Submit complaints
- Manage subscription services
- Make payments for available services

---

## 🚀 Key Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- HTTP-only cookie authentication
- Role-based access control
- Email verification
- Account status management
- Google authentication support

### ⚡ Power Management

- National power generation tracking
- National demand tracking
- Power allocation to distributors
- Substation management
- Feeder management
- Power allocation monitoring

### 🕐 Load Shedding Management

- Create load-shedding schedules
- Feeder-level scheduling
- Schedule approval/rejection workflow
- Schedule publishing
- Planned load-shedding amount tracking
- Prevent unauthorized operators from modifying schedules

### 🚨 Emergency Outage Management

- Report unexpected power outages
- Record outage reason
- Track outage start time
- Assign technicians
- Monitor repair and restoration status

### 👨‍🔧 Technician Management

- Technician registration/management
- Technician availability status
- Skill tracking
- Technician assignment
- Repair status updates

### 🔔 Customer Notification & Complaint

- Notify customers about outages
- Area-based customer identification
- Customer power problem reporting
- Complaint management

### 💳 Subscription & Payment

- Customer subscription management
- Payment processing
- Premium features

---

## 🛠️ Technology Stack

### Backend

- **Node.js**
- **Express.js**
- **TypeScript**

### Database

- **PostgreSQL**
- **Prisma ORM**

### Authentication & Security

- JWT
- HTTP-only Cookies
- bcrypt
- Role-Based Access Control
- Zod validation

### Payment

- bKash

### API Testing & Documentation

- Postman

### Code Quality

- Biome

---

## 🏗️ System Architecture

```text
                         ┌──────────────┐
                         │    Admin     │
                         └──────┬───────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   Power Authority   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Distributor Manager │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
              ┌────────────┐      ┌─────────────┐
              │ Substation │      │  Technician │
              └─────┬──────┘      └─────────────┘
                    │
                    ▼
                ┌────────┐
                │ Feeder │
                └───┬────┘
                    │
                    ▼
             ┌──────────────┐
             │ Power Operator│
             └──────┬───────┘
                    │
                    ▼
              Load Shedding /
              Emergency Outage
                    │
                    ▼
                ┌─────────┐
                │Customer │
                └─────────┘
```

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── config/
│   ├── lib/
│   ├── middlewares/
│   ├── modules/
│   ├── templates/
│   └── utility/
│
├── app.ts
└── server.ts

prisma/
├── schema.prisma
└── migrations/

.env
package.json
tsconfig.json
biome.json
prisma.config.ts
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Navigate to the project

```bash
cd load_shedding_power_outage_management_system_server_b7a6
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

```env
NODE_ENV=your_node_env
WELCOME_MSG=your_welcome_message


DATABASE_URL=your_database_url


PORT=your_port
FRONTEND_URL=your_frontend_url


JWT_ACCESS_SECRET=your_jwt_access_secret_expire_in_time
JWT_REFRESH_SECRET=your_jwt_refresh_secret_expire_in_time
JWT_ACCESS_EXPIRES_IN=your_jwt_access_expire_in_time
JWT_REFRESH_EXPIRES_IN=your_jwt_access_expire_in_time


BCRYPT_SALT_ROUND=your_bcrypt_salt_round


REDIS_USER= your_redis_user
REDIS_PASSWORD= your_redis_password
REDIS_HOST= your_redis_host
REDIS_PORT= your_redis_port
OTP_EXPIRY=your_otp_expiry_in_seconds


CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret


BKASH_BASE_URL= your_bkash_base_url
BKASH_USERNAME= your_bkash_username
BKASH_PASSWORD= your_bkash_password
BKASH_APP_KEY= your_bkash_app_key
BKASH_APP_SECRET= your_bkash_app_secret
BKASH_CALLBACK_URL= your_bkash_callback_url

```

> Never commit your `.env` file to GitHub.

---

## 🗄️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

For production deployment:

```bash
npx prisma migrate deploy
```

---

## ▶️ Run the Project

### Development

```bash
npm run dev
```

The server will start at:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

---

## 🔗 API Base URL

For local development:

```text
http://localhost:3000/api
```

For production:

```text
<your-production-api-url>/api
```

---

## 📚 API Documentation

The API is tested and documented using **Postman**.

The Postman collection contains endpoints for:

- Authentication
- Users
- Power Authority
- Distributors
- Substations
- Feeders
- Power Distribution
- Load Shedding
- Emergency Outages
- Technicians
- Complaints
- Subscriptions
- Payments

Import the exported Postman collection into Postman to explore and test the APIs.

If the collection uses a variable such as:

```text
{{base}}
```

set the Postman environment variable:

```text
base = http://localhost:3000/api
```

For production:

```text
base = <your-production-api-url>/api
```

---

## 🔒 Security

The application follows several backend security practices:

- Password hashing using bcrypt
- JWT authentication
- HTTP-only cookies
- Role-based authorization
- Input validation using Zod
- Centralized error handling
- Protected API routes
- Ownership and role-based resource validation
- Environment-based secret management

---

## 🔄 Main Workflow

### Power Allocation Workflow

```text
National Power Generation
          ↓
Power Authority
          ↓
Power Demand Calculation
          ↓
Power Allocation
          ↓
Distribution Companies
          ↓
Substations
          ↓
Feeders
          ↓
Customers
```

### Load Shedding Workflow

```text
Power Operator
      ↓
Create Schedule
      ↓
Distributor Manager
      ↓
Approve / Reject
      ↓
Publish Schedule
      ↓
Scheduled Load Shedding
```

### Emergency Outage Workflow

```text
Emergency Outage
       ↓
Power Operator
       ↓
Create Outage Report
       ↓
Assign Technician
       ↓
Technician Investigates
       ↓
Repair
       ↓
Power Restored
       ↓
Update Status
       ↓
Customer Notification
```

---

## 🧪 API Testing

API endpoints can be tested using **Postman**.

Recommended testing flow:

```text
Register
   ↓
Login
   ↓
Receive Authentication
   ↓
Access Protected API
   ↓
Test Role-Based Permissions
   ↓
Test Business Logic
   ↓
Test Error Cases
```

---

## 📊 Database Design

The system uses PostgreSQL with Prisma ORM.

Major entities include:

```text
User
Distributor
DistributorManager
PowerAuthority
PowerOperator
Technician
Substation
Feeder
NationalPowerStatus
PowerDistribution
SubstationPowerAllocation
LoadSheddingSchedule
EmergencyOutage
Complaint
Subscription
Payment
```

---

## 🌐 Deployment

The backend can be deployed on **Vercel** or another Node.js-compatible hosting platform.

Before deployment:

1. Configure production environment variables.
2. Configure the production PostgreSQL database.
3. Run Prisma migrations.
4. Build the TypeScript application.
5. Deploy the application.
6. Update the frontend API base URL.

---

## 🎯 Future Improvements

Possible future improvements include:

- Real-time outage updates using Socket.IO
- Advanced power-demand prediction
- Interactive power outage maps
- SMS notifications
- Advanced analytics dashboard
- Automatic load-shedding recommendations
- Improved complaint tracking
- Detailed power consumption reports
- Monitoring and logging system
