"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Droplet,
  MapPin,
  User,
  Search,
  Loader2,
  AlertCircle,
  Users,
  MessageCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// Donor type definition
interface Donor {
  id: number;
  username: string;
  blood_group: string;
  city: string;
  email?: string;
  phone?: string;
}

// Blood group options for filtering
const bloodGroups = [
  "All",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

// Donor card component
function DonorCard({ donor, isAuthenticated, onStartChat }: { donor: Donor; isAuthenticated: boolean; onStartChat: (donor: Donor) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>

          {/* Donor Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {donor.username}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                <Droplet className="w-3 h-3" />
                {donor.blood_group}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {donor.city}
              </span>
            </div>

            {/* Chat Button */}
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 bg-transparent"
                onClick={() => onStartChat(donor)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? "No donors found" : "No donors available"}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {hasFilters
          ? "Try adjusting your search filters to find more donors."
          : "Be the first to register as a blood donor and help save lives!"}
      </p>
    </div>
  );
}

export default function DonorsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchCity, setSearchCity] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");

  // Fetch donors from API
  useEffect(() => {
    const fetchDonors = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/requests/");
        setDonors(response.data);
        setFilteredDonors(response.data);
      } catch (err) {
        console.error("Failed to fetch donors:", err);
        setError("Failed to load donors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonors();
  }, []);

  // Apply filters when search criteria change
  useEffect(() => {
    let filtered = [...donors];

    // Filter by blood group
    if (selectedBloodGroup !== "All") {
      filtered = filtered.filter(
        (donor) => donor.blood_group === selectedBloodGroup
      );
    }

    // Filter by city
    if (searchCity.trim()) {
      const cityLower = searchCity.toLowerCase();
      filtered = filtered.filter((donor) =>
        donor.city.toLowerCase().includes(cityLower)
      );
    }

    setFilteredDonors(filtered);
  }, [donors, selectedBloodGroup, searchCity]);

  // Clear all filters
  const clearFilters = () => {
    setSearchCity("");
    setSelectedBloodGroup("All");
  };

  const hasActiveFilters = searchCity.trim() !== "" || selectedBloodGroup !== "All";

  // Start chat with a donor - this triggers a custom event that the ChatWindow listens to
  const handleStartChat = (donor: Donor) => {
    // Dispatch custom event that ChatWindow will listen to
    const event = new CustomEvent("startChat", { 
      detail: { 
        id: donor.id, 
        username: donor.username, 
        blood_group: donor.blood_group 
      } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Show nav only for authenticated users, simple header for public */}
      {!authLoading && isAuthenticated ? (
        <DashboardNav />
      ) : (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Droplet className="w-7 h-7 text-primary" />
              <span className="text-lg font-bold text-foreground">
                Blood<span className="text-primary">Connect</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Find Blood Donors
          </h1>
          <p className="text-muted-foreground">
            Search for registered blood donors by blood group and location
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search by City */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by city..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Blood Group Filter */}
              <div className="w-full md:w-48">
                <Select
                  value={selectedBloodGroup}
                  onValueChange={setSelectedBloodGroup}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group === "All" ? "All Blood Groups" : group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredDonors.length} donor
              {filteredDonors.length !== 1 ? "s" : ""}
            </p>

            {/* Donor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDonors.length > 0 ? (
                filteredDonors.map((donor) => (
                  <DonorCard 
                    key={donor.id} 
                    donor={donor} 
                    isAuthenticated={isAuthenticated}
                    onStartChat={handleStartChat}
                  />
                ))
              ) : (
                <EmptyState hasFilters={hasActiveFilters} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
