import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

import DashboardLayout from "./components/layouts/DashboardLayout.jsx";
import PublicLayout from "./components/layouts/PublicLayout";

import Resume from "./pages/Resume";
import Categories from "./pages/Categories";
import CategoriesDetail from "./pages/CategoriesDetail";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";
import Savings from "./pages/Savings";
import SavingGoalDetail from "./pages/SavingGoalDetail";
import Calendar from "./pages/Calendar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>



        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        </Route>


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Resume />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/:id" element={<CategoriesDetail />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="payments" element={<Payments />} />
          <Route path="savings" element={<Savings />} />
          <Route path="savings/:id" element={<SavingGoalDetail />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}