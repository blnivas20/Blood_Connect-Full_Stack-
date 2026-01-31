"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { DashboardNav } from "@/components/dashboard-nav";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MapPin,
  Clock,
  User,
  Search,
  Loader2,
  AlertCircle,
  Heart,
  CheckCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Blood request type from API
interface BloodRequest {
  short_id: string;
  requester_name: string;
  patient_name: string;
  patient_age: number;
  blood_group: string;
  urgency: "Emergency" | "Not Urgent";
  location: string;
  pincode: string;
  reason?: string;
  created_at: string;
  status: "Pending" | "Success" | "Cancelled";
}


const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const URGENCY_LEVELS = ["All", "Emergency", "Not Urgent"] as const;


const urgencyConfig = {
  Emergency: {
    label: "Emergency",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  "Not Urgent": {
    label: "Not Urgent",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
} as const;


function BecomeDonorContent() {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch blood requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get("/requests/");
      // Filter only open requests
      const openRequests = response.data.filter(
        (req: BloodRequest) => req.status === "Pending"
      );
      setRequests(openRequests);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load blood requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter requests based on search criteria
  const filteredRequests = requests.filter((request) => {
    const matchesLocation =
      searchLocation === "" ||
      request.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
      request.pincode.includes(searchLocation);

    const matchesBloodGroup =
      selectedBloodGroup === "All" ||
      request.blood_group === selectedBloodGroup;

    const matchesUrgency =
      selectedUrgency === "All" || request.urgency === selectedUrgency;

    return matchesLocation && matchesBloodGroup && matchesUrgency;
  });

  // Accept a blood request
  const handleAcceptRequest = async (shortId: string) => {
    setAcceptingId(shortId);
    setSuccessMessage("");
    try {
      await api.post(`/requests/${shortId}/accept/`);
      setSuccessMessage(
        "You have successfully accepted this request. The requester will be notified."
      );
      // Refresh the requests list
      await fetchRequests();
    } catch (err) {
      console.error("Failed to accept request:", err);
      setError("Failed to accept the request. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Public header for non-authenticated users
  const PublicHeader = () => (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Droplet className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Blood<span className="text-primary">Connect</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {isAuthenticated ? <DashboardNav /> : <PublicHeader />}

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Become a Donor
          </h1>
          <p className="text-muted-foreground">
            Browse blood requests and help save lives by donating blood to those
            in need.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Location Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or pincode..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Blood Group Filter */}
              <div className="w-full md:w-40">
                <Select
                  value={selectedBloodGroup}
                  onValueChange={setSelectedBloodGroup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group === "All" ? "All Blood Groups" : group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urgency Filter */}
              <div className="w-full md:w-40">
                <Select
                  value={selectedUrgency}
                  onValueChange={setSelectedUrgency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level === "All"
                          ? "All Urgency"
                          : level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No requests found
              </h3>
              <p className="text-muted-foreground">
                {requests.length === 0
                  ? "There are currently no open blood requests."
                  : "No requests match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Requests Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const urgency = urgencyConfig[request.urgency] ?? urgencyConfig["Not Urgent"];
              const UrgencyIcon = urgency.icon;

              return (
                <Card
                  key={request.short_id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Droplet className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {request.blood_group}
                          </CardTitle>
                          <CardDescription>
                            {request.patient_name}, {request.patient_age} yrs
                          </CardDescription>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
                          urgency.color
                        )}
                      >
                        <UrgencyIcon className="w-3 h-3" />
                        {urgency.label}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Reason */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {request.reason}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {request.location}
                      </span>
                      <span className="text-muted-foreground">
                        ({request.pincode})
                      </span>
                    </div>

                    {/* Requester */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Requested by{" "}
                        <span className="text-foreground font-medium">
                          {request.requester_name}
                        </span>
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Posted on {formatDate(request.created_at)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    {!isAuthenticated ? (
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    Login to Donate
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleAcceptRequest(request.short_id)}
                  disabled={acceptingId === request.short_id}
                >
                  {acceptingId === request.short_id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Accept & Donate
                    </>
                  )}
                </Button>
              )}

                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BecomeDonorPage() {
  return <BecomeDonorContent />;
}
