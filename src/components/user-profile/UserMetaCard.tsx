"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import ImageUpload from "@/components/common/ImageUpload";
import Image from "next/image";
import {
  getOwnerProfile,
  updateOwnerProfile,
  OwnerProfile,
} from "@/functions/profile";
import { Pencil, Loader2, Trash2 } from "lucide-react";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [avatarUrl, setAvatarUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getOwnerProfile();
      if (data) {
        setProfile(data);
        populateForm(data);
      }
    } catch (err: any) {
      console.error("Error fetching owner profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: OwnerProfile) => {
    setAvatarUrl(data.avatar_url || "");
    setFirstName(data.first_name || "");
    setLastName(data.last_name || "");
    setDisplayName(data.display_name || "");
    setRole(data.role || "");
    setLocation(data.location || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setBio(data.bio || "");
  };

  const handleOpenModal = () => {
    if (profile) {
      populateForm(profile);
    }
    openModal();
  };

  const handleDeleteAvatar = () => {
    setAvatarUrl("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setIsSaving(true);
      const updated = await updateOwnerProfile(profile.id, {
        avatar_url: avatarUrl || null,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name:
          displayName.trim() || `${firstName.trim()} ${lastName.trim()}`.trim(),
        role: role.trim(),
        location: location.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      });

      setProfile(updated);
      closeModal();
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert("Failed to update profile: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
              <Image
                fill
                src={profile?.avatar_url || "/images/user/owner.jpg"}
                alt="user"
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="mb-1 text-center text-lg font-semibold text-gray-800 dark:text-white/90 xl:text-left">
                {profile?.display_name ||
                  `${profile?.first_name || ""} ${profile?.last_name || ""}`}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile?.role || "Owner"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile?.location || "Egaloya, Sri Lanka"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your account details and profile image.
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar max-h-[460px] overflow-y-auto px-2 pb-3">
              {/* Profile Image Avatar Upload using ImageUpload component */}
              <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <div className="mb-2 text-xs font-semibold text-gray-800 dark:text-white/90">
                  Profile Picture
                </div>

                {avatarUrl ? (
                  <div className="relative h-44 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 sm:w-44">
                    <img
                      src={avatarUrl}
                      alt="Profile Avatar"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white shadow hover:bg-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="w-full sm:w-44">
                    <ImageUpload
                      value=""
                      onChange={(url) => setAvatarUrl(url)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>First Name</Label>
                  <Input
                    type="text"
                    value={firstName}
                    placeholder={profile?.first_name || "e.g. Binosh"}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Last Name</Label>
                  <Input
                    type="text"
                    value={lastName}
                    placeholder={profile?.last_name || "e.g. Randula"}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Display Name / Title</Label>
                  <Input
                    type="text"
                    value={displayName}
                    placeholder={profile?.display_name || "e.g. Binosh Randula"}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Role</Label>
                  <Input
                    type="text"
                    value={role}
                    placeholder={profile?.role || "e.g. Owner"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    placeholder={profile?.email || "e.g. owner@premierautohub.com"}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Phone Number</Label>
                  <Input
                    type="text"
                    value={phone}
                    placeholder={profile?.phone || "e.g. +94 77 123 4567"}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Location</Label>
                  <Input
                    type="text"
                    value={location}
                    placeholder={profile?.location || "e.g. Egaloya, Sri Lanka"}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Bio</Label>
                  <Input
                    type="text"
                    value={bio}
                    placeholder={profile?.bio || "Owner & Lead Technician"}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}