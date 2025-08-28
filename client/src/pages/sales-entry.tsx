import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from "@/components/layout/main-layout";
import SalesForm from "@/components/forms/sales-form";

export default function SalesEntry() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    enabled: isAuthenticated,
  });

  const { data: items } = useQuery({
    queryKey: ["/api/items"],
    enabled: isAuthenticated,
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/sales", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sales transaction created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create sales transaction",
        variant: "destructive",
      });
    },
  });

  // Handle unauthorized access
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <MainLayout
      title="Sales Entry"
      subtitle="POS-style sales transaction entry"
    >
      <SalesForm
        customers={customers || []}
        items={items || []}
        onSubmit={createSaleMutation.mutate}
        isSubmitting={createSaleMutation.isPending}
      />
    </MainLayout>
  );
}
