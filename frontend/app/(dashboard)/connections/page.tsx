"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyConnections } from "@/services/api-client";
import { ConnectionRequest } from "@/types";

export default function ConnectionsPage() {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyConnections()
      .then(setRequests)
      .catch(() => setError("Sign in to view your connection requests."));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">My Network & Connections</h1>
        <p className="text-sm text-slate-500">Manage your trusted institutional connections</p>
      </div>

      <div className="mt-8">
        {error ? (
          <Card className="py-12 text-center">
            <CardContent>
              <CardTitle className="text-lg">Sign in required</CardTitle>
              <CardDescription className="mt-1">{error}</CardDescription>
              <Link href="/login">
                <Button className="mt-6">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        ) : requests.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((request) => (
              <Card key={request.id} className="p-5">
                <CardTitle className="text-base">Alumni connection request</CardTitle>
                <CardDescription className="mt-2">
                  Status: {request.status.toLowerCase()}
                </CardDescription>
              </Card>
            ))}
          </div>
        ) : (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">No Pending Connection Requests</CardTitle>
            <CardDescription className="max-w-sm mt-1">
              Start expanding your network by exploring the verified alumni directory.
            </CardDescription>
            <Button className="mt-6" onClick={() => window.location.href = '/discovery'}>
              Find Alumni
            </Button>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
