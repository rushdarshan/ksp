import "../Homepage/landingpage.css";
import Navigation from "./Components/Navigation";
import HeroSection from "./Components/Hero";
import Footer from "./Components/Footer";

const LandingPage = () => {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <Footer/>
    </div>
  );
};
export default LandingPage