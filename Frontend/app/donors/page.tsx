"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplet,
  MapPin,
  User,
  Loader2,
  AlertCircle,
  Users,
  MessageCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Accepted donor type - donors who accepted user's blood requests
interface AcceptedDonor {
  id: number;
  username: string;
  city: string;
  request_id: number;
  request_blood_group: string;
  accepted_at: string;
  unique_id: string;   // 🔥 ADD THIS
}

// Donor card component - simplified to show name, location and chat button
function DonorCard({
  donor,
  onStartChat,
}: {
  donor: AcceptedDonor;
  onStartChat: (donor: AcceptedDonor) => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Donor Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <span className="text-m font-semibold text-red-600 dark:text-red-400">
              {donor.request_blood_group}
            </span>
          </div>
              {/* <User className="w-5 h-5 text-primary" /> */}

            <div className="min-w-0">
              <h3 className="font-medium text-foreground truncate">

                {donor.username}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{donor.city}</span>
              </div>
            </div>
          </div>

          {/* Chat Button */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-transparent"
            onClick={() => onStartChat(donor)}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="sr-only">Chat with {donor.username}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No donors yet
      </h3>
      <p className="text-muted-foreground max-w-md">
        When donors accept your blood requests, they will appear here so you can
        chat with them.
      </p>
    </div>
  );
}

function DonorsContent() {
  const { user } = useAuth();
  const [donors, setDonors] = useState<AcceptedDonor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch accepted donors for user's requests
  useEffect(() => {
    const fetchAcceptedDonors = async () => {
      setIsLoading(true);
      setError("");

      try {
        // API endpoint that returns donors who accepted the user's blood requests
        const response = await api.get("/requests/donors/");
        console.log(response.data);
        setDonors(response.data);
      } catch (err) {
        console.error("Failed to fetch accepted donors:", err);
        setError("Failed to load donors. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAcceptedDonors();
    }
  }, [user]);

  // Start chat with a donor - dispatches custom event that ChatWindow listens to
const handleStartChat = (donor: AcceptedDonor) => {
  const event = new CustomEvent("startChat", {
    detail: {
      id: donor.id,
      username: donor.username,
      unique_id: donor.unique_id,  // 🔥 THIS WAS MISSING
    },
  });

  window.dispatchEvent(event);
};

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            My Donors
          </h1>
          <p className="text-muted-foreground">
            Donors who have accepted your blood requests
          </p>
        </div>

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
        ) : donors.length > 0 ? (
          <>
            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
              {donors.length} donor{donors.length !== 1 ? "s" : ""} accepted your
              requests
            </p>

            {/* Donor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors.map((donor) => (
                <DonorCard
                  key={`${donor.id}-${donor.request_id}`}
                  donor={donor}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

export default function DonorsPage() {
  return (
    <ProtectedRoute>
      <DonorsContent />
    </ProtectedRoute>
  );
}
