import { useState, useEffect } from "react";
import { vendorApi } from "@/services/vendorApi";
import { useAuth } from "@/hooks/useAuth";
import type { Application } from "@/types";

export function useVendorApplications() {
  const { user } = useAuth("vendor");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const data = await vendorApi.getVendorApplications();
      setApplications(data);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching applications", error);
      setIsLoading(false);
    }
  };

  return { applications, isLoading, fetchApplications };
}
