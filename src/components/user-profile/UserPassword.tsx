"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { getOwnerProfile, updateOwnerProfile, OwnerProfile } from "@/functions/profile";
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck, Check, X } from "lucide-react";

export default function UserPassword() {
  const { isOpen, openModal, closeModal } = useModal();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);

  // Modal Form Inputs
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getOwnerProfile();
      if (data) {
        setProfile(data);
      }
    } catch (err: any) {
      console.error("Failed to load security profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setCurrentPasswordInput("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    openModal();
  };

  // Password Validation Criteria Rules
  const criteria = useMemo(() => {
    return {
      hasMinLength: newPassword.length >= 7, // More than 6 characters (min 7)
      hasUppercase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>_\-\\\/+=~`[\]]/.test(newPassword),
      noSpaces: newPassword.length > 0 && !/\s/.test(newPassword),
    };
  }, [newPassword]);

  const isPasswordValid =
    criteria.hasMinLength &&
    criteria.hasUppercase &&
    criteria.hasNumber &&
    criteria.hasSymbol &&
    criteria.noSpaces;

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setErrorMessage(null);

    // 1. Verify current password
    if (currentPasswordInput !== (profile.password || "")) {
      setErrorMessage("The current password you entered is incorrect.");
      return;
    }

    // 2. Validate all rules
    if (!isPasswordValid) {
      setErrorMessage("Please ensure your new password satisfies all the required criteria.");
      return;
    }

    // 3. Check password confirmation match
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password do not match.");
      return;
    }

    // 4. Prevent setting the same password
    if (newPassword === profile.password) {
      setErrorMessage("New password must be different from your current password.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateOwnerProfile(profile.id, {
        password: newPassword.trim(),
      });

      setProfile(updated);
      closeModal();
      alert("Password updated successfully!");
    } catch (err: any) {
      setErrorMessage("Failed to update password: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-36 items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Security & Password
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Account Password
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium tracking-widest text-gray-800 dark:text-white/90">
                    {showCurrentPassword
                      ? profile?.password || "••••••••"
                      : "••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                    title={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Password Status
                </p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secured & Active</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <KeyRound className="h-4 w-4" />
            Reset Password
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[550px]">
        <div className="no-scrollbar relative w-full max-w-[550px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Reset Password
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Enter your current password and define a strong new password.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="flex flex-col">
            <div className="space-y-4 px-2">
              <div>
                <Label>Current Password *</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={currentPasswordInput}
                    placeholder="Enter your current password"
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>New Password *</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={newPassword}
                    placeholder="Create a new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Requirement Checks */}
              {newPassword.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 text-xs dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Password must satisfy:
                  </p>
                  <ul className="space-y-1.5">
                    <li
                      className={`flex items-center gap-2 ${
                        criteria.hasMinLength
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {criteria.hasMinLength ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      <span>More than 6 characters (min. 7)</span>
                    </li>

                    <li
                      className={`flex items-center gap-2 ${
                        criteria.hasUppercase
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {criteria.hasUppercase ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      <span>At least one uppercase letter (A-Z)</span>
                    </li>

                    <li
                      className={`flex items-center gap-2 ${
                        criteria.hasNumber
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {criteria.hasNumber ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      <span>At least one number (0-9)</span>
                    </li>

                    <li
                      className={`flex items-center gap-2 ${
                        criteria.hasSymbol
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {criteria.hasSymbol ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      <span>At least one special symbol (!@#$%^&*)</span>
                    </li>

                    <li
                      className={`flex items-center gap-2 ${
                        criteria.noSpaces
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {criteria.noSpaces ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      <span>No spaces allowed</span>
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <Label>Re-confirm New Password *</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={confirmPassword}
                    placeholder="Re-enter new password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" type="button" onClick={closeModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSaving || !isPasswordValid}>
                {isSaving ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}