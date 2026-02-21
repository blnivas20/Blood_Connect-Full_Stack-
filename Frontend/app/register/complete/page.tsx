"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Droplet, Loader2, AlertCircle, ArrowRight, SkipForward } from "lucide-react";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export default function CompleteProfilePage() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated, isLoading: authLoading, fetchUser } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Validate phone number
  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    return phoneRegex.test(phoneNumber);
  };



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!bloodGroup) {
      setError("Please select your blood group");
      return;
    }

    if (!phone || !validatePhone(phone)) {
      setError("Please enter a valid phone number");
      return;
    }



    setIsLoading(true);

    try {
      // Update user profile with additional details
      await api.patch("/profile/me/", {
        blood_group: bloodGroup,
        phone: phone,
        location: address,
        last_donation_date: lastDonationDate || null,
      });

      // Refresh user data
      await fetchUser();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { detail?: string } };
        };
        setError(
          axiosError.response?.data?.detail ||
            "Failed to update profile. Please try again."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Skip profile completion for now
  const handleSkip = () => {
    router.push("/dashboard");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="py-4 px-4 border-b border-border bg-background">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Droplet className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Blood<span className="text-primary">Connect</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Profile Completion Form */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="w-16 h-1 bg-primary rounded" />
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Welcome, {user?.username}! Please provide additional details to help us connect you with those in need.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Blood Group */}
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">
                  Blood Group <span className="text-destructive">*</span>
                </Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select your blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your street address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Last Donation Date */}
              <div className="space-y-2">
                <Label htmlFor="lastDonation">Last Donation Date</Label>
                <Input
                  id="lastDonation"
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  disabled={isLoading}
                  max={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if you haven&apos;t donated before
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleSkip}
                disabled={isLoading}
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip for now
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
