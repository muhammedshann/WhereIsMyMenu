# WhereIsMyMenu 🍽️

WhereIsMyMenu is a comprehensive Digital Menu Management platform that empowers restaurant owners to create, manage, and share their menus through QR codes. It streamlines the dining experience by providing customers with instant access to digital menus on their own devices.

## 🚀 Features

### For Restaurant Owners
- **Easy Setup:** Quick registration and restaurant profile configuration.
- **Dynamic Menu Management:** Create categories and add menu items with descriptions, prices, and images.
- **QR Code Generation:** Automatically generate unique QR codes for each restaurant that link directly to the digital menu.
- **Dashboard:** Insights and management tools for restaurant operations.
- **Subscription System:** Access premium features through tiered subscription plans integrated with Razorpay.

### For Customers
- **Contactless Experience:** Scan a QR code to view the menu instantly.
- **Rich Menu View:** Browse through categorized items with images and dietary indicators (Veg/Non-Veg).
- **Social Integration:** Easy access to restaurant's social media and location.

### For Administrators
- **Management Console:** oversee all registered restaurants and their statuses.
- **Plan Management:** Create and update subscription plans.
- **Transaction Tracking:** Monitor payments and subscription histories.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

### Backend
- **Framework:** [Django](https://www.djangoproject.com/)
- **API:** [Django REST Framework](https://www.django-rest-framework.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **QR Generation:** `python-qrcode`
- **Payments:** Razorpay Integration

## 📦 Project Structure

```text
WhereIsMyMenu/
├── backend/            # Django REST API
│   ├── adminPanel/     # Admin-specific logic
│   ├── restaurant/     # Core restaurant & menu logic
│   ├── users/          # Authentication & User profiles
│   └── backend/        # Project configuration
├── frontend/           # React + Vite Application
│   ├── src/
│   │   ├── api/        # Axios configurations
│   │   ├── components/ # Reusable UI components
│   │   ├── features/   # Redux slices and page-specific logic
│   │   ├── context/    # React Context providers
│   │   └── store/      # Redux store configuration
└── venv/               # Python virtual environment
```

## ⚙️ Setup and Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in a `.env` file (see `.env.example`).
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.
