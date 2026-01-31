"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { DashboardNav } from "@/components/dashboard-nav";
import { ProtectedRoute } from "@/components/protected-route";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Droplet,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Users,
} from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_LEVELS = [
  { value: "critical", label: "Critical - Need within hours" },
  { value: "high", label: "High - Need within 24 hours" },
  { value: "medium", label: "Medium - Need within 2-3 days" },
  { value: "low", label: "Low - Scheduled requirement" },
];

function RequestBloodContent() {
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [isForSelf, setIsForSelf] = useState(true);
  const [requesterName, setRequesterName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [urgency, setUrgency] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [reason, setReason] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-fill user details when "for self" is selected
  useEffect(() => {
    if (isForSelf && user) {
      setRequesterName(user.username || "");
      setPatientName(user.username || "");
      setBloodGroup(user.blood_group || "");
      setContactPhone(user.phone || "");
      // Fetch full profile to get location details
      fetchUserProfile();
    } else if (!isForSelf) {
      // Clear patient details but keep requester info
      setPatientName("");
      setPatientAge("");
      setBloodGroup("");
    }
  }, [isForSelf, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/profile/me/");
      const profile = response.data;
      if (isForSelf) {
        setLocation(profile.city || "");
        setContactPhone(profile.phone || "");
        setBloodGroup(profile.blood_group || "");
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!requesterName.trim()) {
      setError("Please enter requester name");
      return false;
    }
    if (!patientName.trim()) {
      setError("Please enter patient name");
      return false;
    }
    if (!patientAge || parseInt(patientAge) <= 0) {
      setError("Please enter a valid patient age");
      return false;
    }
    if (!bloodGroup) {
      setError("Please select a blood group");
      return false;
    }
    if (!urgency) {
      setError("Please select urgency level");
      return false;
    }
    if (!location.trim()) {
      setError("Please enter location");
      return false;
    }
    if (!pincode.trim() || pincode.length < 5) {
      setError("Please enter a valid pincode");
      return false;
    }
    if (!reason.trim()) {
      setError("Please provide a reason for the blood request");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post("/requests/", {
        requester_name: requesterName,
        patient_name: patientName,
        patient_age: parseInt(patientAge),
        blood_group: bloodGroup,
        urgency: urgency,
        location: location,
        pincode: pincode,
        reason: reason,
        contact_phone: contactPhone,
      });

      setSuccess(true);
      // Redirect to become-donor page after 2 seconds
      setTimeout(() => {
        router.push("/become-donor");
      }, 2000);
    } catch (err: unknown) {
      console.error("Failed to create request:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as {
          response?: { data?: { detail?: string } };
        };
        setError(
          axiosError.response?.data?.detail ||
            "Failed to create blood request. Please try again."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-muted/30">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Request Submitted!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your blood request has been posted successfully. Donors in your
                area will be notified.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to requests page...
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Request Blood
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to create a blood donation request.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary" />
              Blood Request Form
            </CardTitle>
            <CardDescription>
              Provide accurate information to help donors find and assist you.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Self/Others Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {isForSelf ? (
                    <User className="w-5 h-5 text-primary" />
                  ) : (
                    <Users className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isForSelf ? "Requesting for myself" : "Requesting for someone else"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isForSelf
                        ? "Your profile details will be auto-filled"
                        : "Enter the patient's details manually"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!isForSelf}
                  onCheckedChange={(checked) => setIsForSelf(!checked)}
                />
              </div>

              {/* Requester Name */}
              <div className="space-y-2">
                <Label htmlFor="requesterName">
                  Requester Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="requesterName"
                  type="text"
                  placeholder="Your name"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Patient Details Section */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="font-medium text-foreground">Patient Details</h3>

                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="patientName">
                    Patient Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    type="text"
                    placeholder="Patient's full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    disabled={isLoading || isForSelf}
                  />
                </div>

                {/* Patient Age and Blood Group */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientAge">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="patientAge"
                      type="number"
                      placeholder="Age in years"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      disabled={isLoading}
                      min="1"
                      max="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">
                      Blood Group <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bloodGroup}
                      onValueChange={setBloodGroup}
                      disabled={isLoading || (isForSelf && !!user?.blood_group)}
                    >
                      <SelectTrigger id="bloodGroup">
                        <SelectValue placeholder="Select" />
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
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-2">
                <Label htmlFor="urgency">
                  Urgency Level <span className="text-destructive">*</span>
                </Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger id="urgency">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location and Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location/City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City or area"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder="Area pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="Phone number for contact"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for Request <span className="text-destructive">*</span>
                </Label>
                <textarea
                  id="reason"
                  className="w-full min-h-24 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Briefly describe why blood is needed (e.g., surgery, accident, medical condition)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 mr-2" />
                    Submit Blood Request
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your request will be visible to registered donors in your area.
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default function RequestBloodPage() {
  return (
    <ProtectedRoute>
      <RequestBloodContent />
    </ProtectedRoute>
  );
}
