"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  getCoworkers,
  createCoworker,
  updateCoworker,
  deleteCoworker,
  Coworker,
  CoworkerPayload,
} from "@/functions/coworkers";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import ImageUpload from "@/components/common/ImageUpload";
import { Pencil, Trash2, UserPlus, Loader2, RefreshCw, Eye, EyeOff, Lock } from "lucide-react";

export default function CoworkersPage() {
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingCoworker, setEditingCoworker] = useState<Coworker | null>(null);

  // Form Fields
  const [avatarUrl, setAvatarUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("Active");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [cityState, setCityState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [taxId, setTaxId] = useState("");

  const fetchCoworkersData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getCoworkers();
      setCoworkers(data || []);
    } catch (err: any) {
      console.error("Error fetching coworkers:", err);
      setErrorMsg(err?.message || "Failed to fetch co-workers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoworkersData();
  }, []);

  const resetForm = () => {
    setEditingCoworker(null);
    setAvatarUrl("");
    setFirstName("");
    setLastName("");
    setJobTitle("");
    setStatus("Active");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setPhone("");
    setBio("");
    setCountry("Sri Lanka");
    setCityState("");
    setPostalCode("");
    setTaxId("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (worker: Coworker) => {
    setEditingCoworker(worker);
    setAvatarUrl(worker.avatar_url || "");
    setFirstName(worker.first_name || "");
    setLastName(worker.last_name || "");
    setJobTitle(worker.job_title || "");
    setStatus(worker.status || "Active");
    setEmail(worker.email || "");
    setPassword(worker.password || "");
    setShowPassword(false);
    setPhone(worker.phone || "");
    setBio(worker.bio || "");
    setCountry(worker.country || "Sri Lanka");
    setCityState(worker.city_state || "");
    setPostalCode(worker.postal_code || "");
    setTaxId(worker.tax_id || "");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("First Name, Last Name, and Email are required.");
      return;
    }

    if (!editingCoworker && !password.trim()) {
      alert("Password is required for new co-workers.");
      return;
    }

    const payload: CoworkerPayload = {
      avatar_url: avatarUrl || null,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      job_title: jobTitle.trim() || "Staff Member",
      status: status,
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim() || null,
      bio: bio.trim() || null,
      country: country.trim() || "Sri Lanka",
      city_state: cityState.trim() || null,
      postal_code: postalCode.trim() || null,
      tax_id: taxId.trim() || null,
    };

    try {
      setIsSaving(true);

      if (editingCoworker) {
        const updated = await updateCoworker(editingCoworker.id, payload);
        setCoworkers((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        alert("Co-worker updated successfully!");
      } else {
        const created = await createCoworker(payload);
        setCoworkers((prev) => [created, ...prev]);
        alert("Co-worker added successfully!");
      }

      handleCloseModal();
    } catch (err: any) {
      alert("Failed to save co-worker: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this co-worker record?"
    );
    if (!confirmDelete) return;

    try {
      await deleteCoworker(id);
      setCoworkers((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert("Failed to delete: " + (err.message || err));
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          <div className="py-2">
            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Co-Workers
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage company team members, employee records, and credentials.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchCoworkersData}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                >
                  <UserPlus className="h-4 w-4" />
                  + Add Co-Worker
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Loading & Empty State */}
            {loading ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span>Loading co-workers...</span>
              </div>
            ) : coworkers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-4 text-gray-500 dark:text-gray-400">
                  No co-workers found. Click below to add your first team member.
                </p>
                <Button size="sm" onClick={handleOpenAddModal}>
                  + Add Co-Worker
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {coworkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    {/* Profile Card Header */}
                    <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                          <Image
                            src={worker.avatar_url || "/images/user/owner.jpg"}
                            alt={`${worker.first_name} ${worker.last_name}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {worker.first_name} {worker.last_name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{worker.job_title || "Staff Member"}</span>
                            {worker.city_state && (
                              <>
                                <span>•</span>
                                <span>{worker.city_state}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            worker.status === "Active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {worker.status || "Active"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(worker)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(worker.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Personal Information & Credentials Section */}
                    <div>
                      <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                        Personal Information & Account
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            First Name
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {worker.first_name || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Last Name
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {worker.last_name || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Email address
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {worker.email || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Phone
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {worker.phone || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Account Password
                          </span>
                          <span className="font-mono text-sm font-medium tracking-wider text-gray-800 dark:text-gray-200">
                            ••••••••••••
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Role / Title
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {worker.job_title || "—"}
                          </span>
                        </div>
                      
                      </div>
                    </div>

              
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Co-Worker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="m-4 max-w-[700px]"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-10">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {editingCoworker ? "Edit Co-Worker" : "Add New Co-Worker"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {editingCoworker
                ? "Update details, credentials, and role permissions for this staff member."
                : "Fill in the information below to add a new employee and create their login credentials."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="custom-scrollbar max-h-[480px] overflow-y-auto px-2 pb-3">
              {/* Profile Image */}
              <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <div className="mb-2 text-xs font-semibold text-gray-800 dark:text-white/90">
                  Profile Picture
                </div>
                {avatarUrl ? (
                  <div className="relative h-36 w-36 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white shadow hover:bg-red-700"
                    >
                      Remove
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
                <div>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    value={firstName}
                    placeholder="e.g. Kasun"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    value={lastName}
                    placeholder="e.g. Perera"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    placeholder="e.g. kasun@premierautohub.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Account Password {editingCoworker ? "" : "*"}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder={
                        editingCoworker
                          ? "Leave blank to keep unchanged"
                          : "Enter strong password"
                      }
                      onChange={(e) => setPassword(e.target.value)}
                      required={!editingCoworker}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>Job Title / Role</Label>
                  <Input
                    type="text"
                    value={jobTitle}
                    placeholder="e.g. Audio Technician"
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="text"
                    value={phone}
                    placeholder="e.g. +94 71 234 5678"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    value={country}
                    placeholder="e.g. Sri Lanka"
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <div>
                  <Label>City/State</Label>
                  <Input
                    type="text"
                    value={cityState}
                    placeholder="e.g. Egaloya, Western Province"
                    onChange={(e) => setCityState(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    value={postalCode}
                    placeholder="e.g. 12000"
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>

                <div>
                  <Label>TAX ID</Label>
                  <Input
                    type="text"
                    value={taxId}
                    placeholder="e.g. TAX-CW-002"
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>

                <div className="col-span-1 lg:col-span-2">
                  <Label>Bio / Notes</Label>
                  <Input
                    type="text"
                    value={bio}
                    placeholder="Senior electrical engineer and installer..."
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
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingCoworker
                  ? "Save Changes"
                  : "Add Co-Worker"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}