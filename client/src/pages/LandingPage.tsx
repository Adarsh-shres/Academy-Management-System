import { useScrollReveal } from '../hooks/useScrollReveal';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Cards from '../components/landing/Cards';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';
import '../styles/landing.css';

export default function LandingPage() {
  const rootRef = useScrollReveal();

  return (
    <div className="landing-root" ref={rootRef}>
      <Navbar />
      <Hero />
      <Features />
      <Cards />
      <Contact />
      <Footer />
    </div>
  );
}
