import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero Section */}
      <section className="container py-20 text-center flex-grow">
        <h1 className="text-5xl font-bold text-gray-600 mb-4">
          Collaborate, Communicate, Succeed
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          TeamSync is the ultimate chat-based platform for seamless team
          collaboration.
        </p>
        <div className="flex justify-center space-x-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-gray-600 text-center mb-8">
          Why Choose TeamSync?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Real-Time Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Communicate with your team in real-time with our fast and
                reliable chat system.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Organize your team into channels and collaborate efficiently on
                projects.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">
                File Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Share files, documents, and media with your team effortlessly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of teams who are already collaborating on TeamSync.
          </p>
          <Button
            className="bg-white text-slate-900 hover:bg-lightGray"
            onClick={() => navigate("/auth")}
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </>
  );
};

export default Home;
