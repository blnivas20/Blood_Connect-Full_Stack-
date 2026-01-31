"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardNav } from "@/components/dashboard-nav";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Droplet,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Blood group options
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Profile content component
function ProfileContent() {
  const { user, fetchUser } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isDonor, setIsDonor] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch and populate profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true);
      try {
        const response = await api.get("/profile/me/");
        const data = response.data;
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        setBloodGroup(data.blood_group || "");
        setIsDonor(data.is_donor || false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await api.patch("/profile/me/", {
        email,
        phone,
        city,
        blood_group: bloodGroup,
        is_donor: isDonor,
      });

      // Refresh user data in context
      await fetchUser();
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        setError(
          axiosError.response?.data?.detail || "Failed to update profile."
        );
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-muted/30">
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your profile information and donor status
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {user?.username}
                </h3>
                <p className="text-sm text-muted-foreground">{email}</p>

                {bloodGroup && (
                  <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
                    <Droplet className="w-4 h-4" />
                    {bloodGroup}
                  </span>
                )}

                <div className="mt-4 w-full pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Donor Status</p>
                  <p
                    className={`font-medium ${isDonor ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    {isDonor ? "Active Donor" : "Not a Donor"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Alerts */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Username (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={user?.username || ""}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={bloodGroup}
                    onValueChange={setBloodGroup}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="bloodGroup">
                      <SelectValue placeholder="Select your blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Donor Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="isDonor" className="text-base font-medium">
                      Register as Blood Donor
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to people seeking blood donors
                    </p>
                  </div>
                  <Switch
                    id="isDonor"
                    checked={isDonor}
                    onCheckedChange={setIsDonor}
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Main profile page wrapped in ProtectedRoute
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
