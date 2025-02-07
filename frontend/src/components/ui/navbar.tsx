import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container flex justify-between items-center p-4">
        {/* Logo */}
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          TeamSync
        </div>

        {/* Get Started Button */}
        <Button
          className="text-white hover:bg-midnightBlue"
          onClick={() => navigate("/auth?login=true")}
        >
          Login
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
