import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PageNotFoundFallback = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white text-black">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold">404</h1>
        <p className="text-2xl mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-lg mb-8">
          It seems like you've reached a page that isn't available. Let's get
          you back home.
        </p>
        <Button
          onClick={handleReturnHome}
          className="px-6 py-3 bg-white border-2 border-black text-black hover:bg-black hover:text-white rounded-lg text-xl transition duration-200 ease-in-out"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default PageNotFoundFallback;
