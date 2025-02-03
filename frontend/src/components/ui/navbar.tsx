import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container flex justify-between items-center p-4">
        {/* Logo */}
        <div className="text-2xl font-bold text-royalBlue">TeamSync</div>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className="text-darkGray hover:text-royalBlue"
          >
            Features
          </Button>
          <Button
            variant="ghost"
            className="text-darkGray hover:text-royalBlue"
          >
            Pricing
          </Button>
          <Button
            variant="ghost"
            className="text-darkGray hover:text-royalBlue"
          >
            Contact
          </Button>
        </div>

        {/* Get Started Button */}
        <Button className="text-white hover:bg-midnightBlue">
          Join Now
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
