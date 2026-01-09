"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/components/SessionContextProvider";

export type PremiumTier = "free" | "plus" | "premium";

export interface PremiumFeatures {
  maxDailyLikes: number;
  maxDailyPasses: number;
  advancedFilters: boolean;
  hideVerificationBadge: boolean;
  priorityInSearch: boolean;
  rewindLastAction: boolean;
  unlimitedMessages: boolean;
  unseenProfiles: boolean;
  viewWhoLikedYou: boolean;
  customProfile: boolean;
}

const tierFeatures: Record<PremiumTier, PremiumFeatures> = {
  free: {
    maxDailyLikes: 10,
    maxDailyPasses: 10,
    advancedFilters: false,
    hideVerificationBadge: false,
    priorityInSearch: false,
    rewindLastAction: false,
    unlimitedMessages: false,
    unseenProfiles: false,
    viewWhoLikedYou: false,
    customProfile: false,
  },
  plus: {
    maxDailyLikes: 50,
    maxDailyPasses: 50,
    advancedFilters: true,
    hideVerificationBadge: false,
    priorityInSearch: true,
    rewindLastAction: true,
    unlimitedMessages: true,
    unseenProfiles: true,
    viewWhoLikedYou: false,
    customProfile: false,
  },
  premium: {
    maxDailyLikes: 999,
    maxDailyPasses: 999,
    advancedFilters: true,
    hideVerificationBadge: true,
    priorityInSearch: true,
    rewindLastAction: true,
    unlimitedMessages: true,
    unseenProfiles: true,
    viewWhoLikedYou: true,
    customProfile: true,
  },
};

interface PremiumTierInfo {
  tier: PremiumTier;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  highlightFeatures: string[];
}

const tiers: PremiumTierInfo[] = [
  {
    tier: "free",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Get started with essential features",
    highlightFeatures: [
      "10 daily likes/passes",
      "Basic matching",
      "Messaging",
    ],
  },
  {
    tier: "plus",
    priceMonthly: 9.99,
    priceAnnual: 79.99,
    description: "Unlock advanced discovery tools",
    highlightFeatures: [
      "50 daily likes/passes",
      "Advanced filters",
      "Priority visibility",
      "Rewind last action",
      "Unlimited messages",
      "See who's active",
    ],
  },
  {
    tier: "premium",
    priceMonthly: 19.99,
    priceAnnual: 159.99,
    description: "Premium experience with all features",
    highlightFeatures: [
      "Unlimited likes/passes",
      "All Plus features",
      "See who likes you",
      "Hide verification badge",
      "Custom profile design",
      "Priority support",
    ],
  },
];

interface PremiumCheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PremiumTierInfo;
  billingPeriod: "monthly" | "annual";
}

export const PremiumCheckout: React.FC<PremiumCheckoutDialogProps> = ({
  isOpen,
  onClose,
  tier,
  billingPeriod,
}) => {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    setIsLoading(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          tier: tier.tier,
          billingPeriod,
          priceId:
            billingPeriod === "monthly"
              ? `price_${tier.tier}_monthly`
              : `price_${tier.tier}_annual`,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout");

      const { sessionUrl } = await response.json();

      // Redirect to Stripe checkout
      if (sessionUrl) {
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Upgrade to {tier.tier}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-4xl font-bold">
              ${billingPeriod === "monthly" ? tier.priceMonthly : tier.priceAnnual}
            </div>
            <p className="text-muted-foreground">
              {billingPeriod === "monthly" ? "/month" : "/year"}
            </p>
            {billingPeriod === "annual" && (
              <Badge className="mt-2" variant="secondary">
                Save 33%
              </Badge>
            )}
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Processing..." : "Upgrade Now"}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

interface PremiumPricingProps {
  currentTier?: PremiumTier;
  onUpgrade?: (tier: PremiumTier) => void;
}

export const PremiumPricing: React.FC<PremiumPricingProps> = ({
  currentTier = "free",
  onUpgrade,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [selectedTier, setSelectedTier] = useState<PremiumTierInfo | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Tier</h2>
        <p className="text-muted-foreground mb-6">
          Unlock features to enhance your experience
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={billingPeriod === "monthly" ? "default" : "outline"}
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === "annual" ? "default" : "outline"}
            onClick={() => setBillingPeriod("annual")}
          >
            Annual
            <Badge className="ml-2" variant="secondary">
              Save 33%
            </Badge>
          </Button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.tier}
            className={`relative flex flex-col ${
              tier.tier === currentTier ? "ring-2 ring-primary" : ""
            }`}
          >
            {tier.tier === "premium" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary">Most Popular</Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tier.tier === "free" && <Heart className="h-5 w-5" />}
                {tier.tier === "plus" && <Zap className="h-5 w-5" />}
                {tier.tier === "premium" && <Crown className="h-5 w-5" />}
                {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {tier.description}
              </p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <div className="mb-6">
                <div className="text-3xl font-bold">
                  ${billingPeriod === "monthly" ? tier.priceMonthly : tier.priceAnnual}
                </div>
                <p className="text-muted-foreground">
                  {billingPeriod === "monthly" ? "/month" : "/year"}
                </p>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {tier.highlightFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  setSelectedTier(tier);
                  onUpgrade?.(tier.tier);
                }}
                variant={
                  tier.tier === currentTier ? "outline" : "default"
                }
                className="w-full"
                disabled={tier.tier === currentTier}
              >
                {tier.tier === currentTier ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Feature</th>
                <th className="text-center py-3 px-4">Free</th>
                <th className="text-center py-3 px-4">Plus</th>
                <th className="text-center py-3 px-4">Premium</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(tierFeatures.free).map(([feature, _]) => (
                <tr key={feature} className="border-b">
                  <td className="py-3 px-4 font-medium capitalize">
                    {feature.replace(/([A-Z])/g, " $1")}
                  </td>
                  <td className="text-center py-3 px-4">
                    {tierFeatures.free[feature as keyof PremiumFeatures] ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {tierFeatures.plus[feature as keyof PremiumFeatures] ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {tierFeatures.premium[feature as keyof PremiumFeatures] ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const getPremiumFeatures = (tier: PremiumTier): PremiumFeatures => {
  return tierFeatures[tier];
};
