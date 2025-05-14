"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConsoleWrapper from "../console-wrapper";

export default function CurrentVisitorIp() {
  const [ip, setIp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getIp = async () => {
    setLoading(true);
    setIp(null);
    try {
      const res = await fetch("/api/get-ip");
      const data = await res.json();
      setIp(data.ip);
    } catch {
      setIp("Error fetching IP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-mono flex gap-2 text-sm  space-y-4">
      <Button onClick={getIp} disabled={loading} variant="secondary">
        {loading ? "Fetching IP..." : "See your IP address?"}
      </Button>

      {ip && (
        <p>
          <strong>{ip}</strong>
        </p>
      )}
    </div>
  );
}
