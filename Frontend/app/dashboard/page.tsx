"use client";

import React from "react"

import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardNav } from "@/components/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  User,
  Heart,
  MapPin,
  ArrowRight,
  Droplet,
} from "lucide-react";

// Quick action card component
function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  buttonText,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={href}>
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Dashboard content component
function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-muted-foreground">
                Ready to save lives today?
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Blood Type</p>
                  <p className="text-2xl font-bold text-foreground">
                    {user?.blood_group || "Not Set"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Location</p>
                  <p className="text-2xl font-bold text-foreground">
                    {user?.location || "Not Set"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              icon={Users}
              title="Find Donors"
              description="Search for blood donors in your area by blood group and location"
              href="/donors"
              buttonText="Browse Donors"
            />
            <QuickActionCard
              icon={User}
              title="Update Profile"
              description="Keep your profile updated to help others find you when needed"
              href="/profile"
              buttonText="Edit Profile"
            />
            <QuickActionCard
              icon={Heart}
              title="Become a Donor"
              description="Register as a blood donor and start saving lives in your community"
              href="/become-donor"
              buttonText="Donate"
            />
          </div>
        </div>

        {/* Info Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Droplet className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Did you know?
                </h3>
                <p className="text-muted-foreground text-sm">
                  A single blood donation can save up to three lives. By registering
                  as a donor on Blood Connect, you become part of a network that
                  helps ensure blood is available when and where it&apos;s needed most.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/donors">Find Donors</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Main dashboard page wrapped in ProtectedRoute
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
