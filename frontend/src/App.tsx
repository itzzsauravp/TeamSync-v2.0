import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoutes from "./layouts/ProtectedLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Index from "./pages/Dashboard";
import Kanban from "./pages/Dashboard/Kanban";
import Message from "./pages/Dashboard/Message";
import Settings from "./pages/Dashboard/Settings";
import Task from "./pages/Dashboard/Task";
import PageNotFoundFallback from "./pages/PageNotFoundFallback";
import Admin from "./pages/Admin";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Main Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<AuthPage />} />
        </Route>

        <Route
          path="dashboard"
          element={
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Index />} />
          <Route path="message" element={<Message />} />
          <Route path="task" element={<Task />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="admin" element={<Admin />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<PageNotFoundFallback />} />
      </Routes>
    </Router>
  );
};

export default App;
