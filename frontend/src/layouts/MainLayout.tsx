import Navbar from "@/components/ui/navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-lightGray">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
