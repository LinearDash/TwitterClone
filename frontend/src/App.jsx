import { Route, Routes } from "react-router-dom";
import Toaster from "react-hot-toast";
import "./App.css";
import HomePage from "./pages/Home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import SideBar from "./components/common/SideBar";
import RightPannel from "./components/common/RightPannel";
import NotificationPage from "./pages/Notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <SideBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
      <RightPannel />
      <Toaster />
    </div>
  );
}

export default App;
