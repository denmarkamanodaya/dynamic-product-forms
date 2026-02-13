# Dynamic Product Form Application

A modern React frontend application featuring dynamic product forms with API integration and glassmorphism design.

## Features

- **Dynamic Forms**: Add and remove product forms on the fly.
- **API Integration**: Fetch real product data from [DummyJSON](https://dummyjson.com/) by entering a Product ID (1-100).
- **Automatic Calculations**: Real-time updates for line item totals and grand total.
- **Premium UI**: Uses custom CSS for a glassmorphism effect, smooth animations, and responsive layout.

## Technologies

- **ReactJS**: Component-based UI.
- **Vite**: Fast development server and build tool.
- **Vanilla CSS**: Custom styling with CSS variables and modern layout techniques.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:5173` to see the application.

## Usage

1.  Click **"+ Add New Product"** to create a new form.
2.  **Select a Product** from the dropdown menu (fetches list from DummyJSON).
3.  The app will automatically fill the form with product details (Name, Price, Image).
4.  Adjust **Quantity** or override **Price** manually.
5.  View the calculated **Grand Total** at the bottom.
