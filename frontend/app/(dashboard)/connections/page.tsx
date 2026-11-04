"use client";

import { Users, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">My Network & Connections</h1>
        <p className="text-sm text-slate-500">Manage your trusted institutional connections</p>
      </div>

      <div className="mt-8">
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
      </div>
    </div>
  );
}
