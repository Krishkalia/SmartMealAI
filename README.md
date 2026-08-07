<div align="center">
  <img src="https://via.placeholder.com/150/F59E0B/FFFFFF?text=SmartMeal+AI" alt="SmartMeal AI Logo" width="100" height="100" style="border-radius: 20px;">
  
  # SmartMeal AI 🍳✨
  
  **Your Intelligent, Budget-Conscious, and Pantry-Aware Kitchen Assistant.**
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#environment-variables">Configuration</a>
  </p>
</div>

---

## 🌟 Overview

**SmartMeal AI** is a premium, full-stack MERN application that completely revolutionizes meal planning. It takes the guesswork out of "what's for dinner?" by intelligently analyzing your current pantry inventory, respecting your budget constraints, strictly adhering to your dietary restrictions, and instantly generating beautiful, fully-costed daily meal plans using the power of Google's **Gemini AI**.

Say goodbye to food waste and tedious grocery list writing. SmartMeal AI handles everything from smart recipe generation to building consolidated shopping lists.

---

## 🔥 Core Features

*   **🤖 AI Pantry Vision:** Too tired to type? Upload a picture of your fridge or pantry shelf, and our AI will automatically identify and add the ingredients to your inventory.
*   **🔄 Interactive Smart Swaps:** Don't like an ingredient? Click the swap icon, and the AI will suggest a perfect culinary substitute that still respects your budget and dietary constraints.
*   **🛒 Consolidated Shopping Lists:** Automatically combines identical ingredients across multiple meals into a single, easy-to-read checklist. Add custom items manually, or auto-populate staples!
*   **⏱️ Cooking Timeline:** Schedule and overlap your prep and cook times efficiently with a visual timeline of your daily meals.
*   **💸 Budget & Price Tracking:** Accurate cost estimations powered by a local database of standard ingredient prices ensure you never blow your weekly grocery budget.
*   **🗺️ Context-Aware Guided Tours:** A sleek, step-by-step onboarding experience built with `driver.js` that helps new users master every module instantly.
*   **🎨 Premium UI:** A gorgeous, highly polished interface utilizing smooth fluid animations, SweetAlerts, and responsive TailwindCSS design.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v7
- **Alerts/Modals:** SweetAlert2
- **Tours/Onboarding:** Driver.js
- **Animations:** Auto-Animate

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **AI Engine:** Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YourUsername/SmartMealAI.git
   cd SmartMealAI
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🔐 Environment Variables

You need to create a `.env` file in both the `frontend` and `backend` directories.

### `backend/.env`
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

---

## 🏃‍♂️ Running the Application

To run the application locally, you will need two terminal windows.

**Terminal 1: Start the Backend Server**
```bash
cd backend
npm run dev
```

**Terminal 2: Start the Frontend Dev Server**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/YourUsername/SmartMealAI/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <i>Built with ❤️ using the MERN stack and Google Gemini.</i>
</div>
