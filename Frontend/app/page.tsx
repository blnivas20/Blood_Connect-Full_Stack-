"use client";

import React from "react"

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Heart, Users, MapPin, Clock, ArrowRight, Droplet } from "lucide-react";

// Feature card component for the features section
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// Stats component to show impact numbers
function StatsSection() {
  const stats = [
    { value: "10,000+", label: "Registered Donors" },
    { value: "5,000+", label: "Lives Saved" },
    { value: "100+", label: "Cities Covered" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-primary-foreground/80 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Droplet className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Blood<span className="text-primary">Connect</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/donors"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Find Donors
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                <span>Every drop counts</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                Connect Donors,{" "}
                <span className="text-primary">Save Lives</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
                Blood Connect bridges the gap between blood donors and those in
                need. Join our community of life-savers and make a difference
                today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/register">
                    Become a Donor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto bg-transparent"
                >
                  <Link href="/donors">Find Donors Near You</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Blood Connect?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We make blood donation simple, safe, and accessible for everyone
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={Users}
                title="Verified Donors"
                description="All donors are verified to ensure safety and reliability of blood donations"
              />
              <FeatureCard
                icon={MapPin}
                title="Location Based"
                description="Find donors in your city quickly with our location-based search system"
              />
              <FeatureCard
                icon={Clock}
                title="Quick Response"
                description="Get connected with available donors within minutes during emergencies"
              />
              <FeatureCard
                icon={Heart}
                title="Save Lives"
                description="Your donation can save up to three lives. Join our mission today"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  About Blood Connect
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Blood Connect is a platform dedicated to connecting blood
                  donors with patients in need. Our mission is to ensure that no
                  one dies due to the unavailability of blood.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We believe in the power of community and technology to solve
                  one of healthcare&apos;s most critical challenges. By registering as
                  a donor, you become part of a life-saving network.
                </p>
                <Button asChild>
                  <Link href="/register">Join Our Community</Link>
                </Button>
              </div>
              <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-1">
                        Register as a Donor
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Create your profile with blood group and location details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-1">
                        Get Notified
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Receive alerts when someone needs your blood type nearby
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-1">
                        Save Lives
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Connect with patients and donate blood to save lives
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Join thousands of donors who are saving lives every day. Your
              contribution matters.
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/register">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Droplet className="w-6 h-6 text-primary" />
              <span className="font-bold text-foreground">BloodConnect</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact Us
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2026 Blood Connect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
