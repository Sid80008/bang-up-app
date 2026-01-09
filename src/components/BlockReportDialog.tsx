"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@/components/SessionContextProvider";

interface BlockReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName?: string;
}

type ReportReason =
  | "inappropriate_content"
  | "harassment"
  | "fake_profile"
  | "scam"
  | "explicit_content"
  | "other";

export const BlockReportDialog: React.FC<BlockReportDialogProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName = "User",
}) => {
  const { user } = useSession();
  const [actionType, setActionType] = useState<"block" | "report">("block");
  const [reportReason, setReportReason] = useState<ReportReason>("inappropriate_content");
  const [reportDetails, setReportDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);

    try {
      if (actionType === "block") {
        // Add to blocked users table
        const { error } = await supabase.from("blocked_users").insert({
          user_id: user.id,
          blocked_user_id: targetUserId,
          reason: reportReason,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success(`${targetUserName} has been blocked`);
      } else {
        // Create report
        const { error } = await supabase.from("user_reports").insert({
          reporter_id: user.id,
          reported_user_id: targetUserId,
          reason: reportReason,
          details: reportDetails,
          status: "pending",
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success("Report submitted. Thank you for keeping our community safe.");
      }

      setShowConfirm(false);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error processing action:", error);
      toast.error("Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setActionType("block");
    setReportReason("inappropriate_content");
    setReportDetails("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Block or Report {targetUserName}</DialogTitle>
            <DialogDescription>
              Choose an action to manage this user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Action Type Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">What would you like to do?</Label>
              <RadioGroup value={actionType} onValueChange={(v) => setActionType(v as "block" | "report")}>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="block" id="block" />
                  <Label htmlFor="block" className="cursor-pointer font-normal">
                    Block this user
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground ml-6 mb-4">
                  You won't see this user's profile, and they won't see yours
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="report" id="report" />
                  <Label htmlFor="report" className="cursor-pointer font-normal">
                    Report this user
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground ml-6">
                  Report suspicious or inappropriate behavior to our team
                </div>
              </RadioGroup>
            </div>

            {/* Reason Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Reason</Label>
              <RadioGroup value={reportReason} onValueChange={(v) => setReportReason(v as ReportReason)}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inappropriate_content" id="reason-1" />
                    <Label htmlFor="reason-1" className="cursor-pointer font-normal">
                      Inappropriate content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="harassment" id="reason-2" />
                    <Label htmlFor="reason-2" className="cursor-pointer font-normal">
                      Harassment or abuse
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fake_profile" id="reason-3" />
                    <Label htmlFor="reason-3" className="cursor-pointer font-normal">
                      Fake profile
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scam" id="reason-4" />
                    <Label htmlFor="reason-4" className="cursor-pointer font-normal">
                      Scam or catfishing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="explicit_content" id="reason-5" />
                    <Label htmlFor="reason-5" className="cursor-pointer font-normal">
                      Explicit/sexual content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="reason-6" />
                    <Label htmlFor="reason-6" className="cursor-pointer font-normal">
                      Other
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Details for Report */}
            {actionType === "report" && (
              <div>
                <Label htmlFor="details" className="text-base font-semibold mb-2 block">
                  Additional details (optional)
                </Label>
                <Textarea
                  id="details"
                  placeholder="Provide more context about why you're reporting this user..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
              variant={actionType === "report" ? "default" : "destructive"}
            >
              {actionType === "block" ? "Block User" : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "block" ? "Block User?" : "Submit Report?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "block"
                ? `${targetUserName} will be blocked and you won't be able to interact with each other.`
                : "Our moderation team will review this report. Thank you for helping keep our community safe."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm"}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
