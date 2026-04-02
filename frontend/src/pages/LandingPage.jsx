import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Analytics from "../components/Analytics";
import RiderShowcase from "../components/RiderShowcase";
import Footer from "../components/Footer";
import Fraud from "../components/Fraud";
import LiveBackground from "../components/LiveBackground";

function LandingPage() {
  return (
    <div className="App landing-page">
      <LiveBackground />
      <Navbar />
      <Hero />
      <Analytics />
      <RiderShowcase />

      <Fraud />

      <Footer />
    </div>
  );
}

export default LandingPage;
