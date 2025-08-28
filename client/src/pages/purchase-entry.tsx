import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/api";
import MainLayout from "@/components/layout/main-layout";
import PurchaseForm from "@/components/forms/purchase-form";

export default function PurchaseEntry() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: vendors } = useQuery({
    queryKey: ["/api/vendors"],
    enabled: isAuthenticated,
  });

  const { data: items } = useQuery({
    queryKey: ["/api/items"],
    enabled: isAuthenticated,
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/purchases", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase transaction created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
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
        description: "Failed to create purchase transaction",
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
      title="Purchase Entry"
      subtitle="Record vendor purchases with excise and VAT"
    >
      <PurchaseForm
        vendors={vendors || []}
        items={items || []}
        onSubmit={createPurchaseMutation.mutate}
        isSubmitting={createPurchaseMutation.isPending}
      />
    </MainLayout>
  );
}
