"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  return (
    <div className="space-y-4">
      <CldUploadWidget
        uploadPreset="upload_preset"
        options={{
          maxFiles: 1,
          resourceType: "image",
          sources: ["local", "url"],
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#909D9D",
              tabIcon: "#0078FF",
              menuBg: "#512b2b",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2D5A",
              error: "#F44235",
              inProgress: "#3a434e",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        }}
        onSuccess={(result: any, { widget }) => {
          if (result?.info?.secure_url) {
            onChange(result.info.secure_url);
          }
          widget.close();
        }}
      >
        {({ open }) => {
          function handleOnClick(e: React.MouseEvent<HTMLButtonElement>) {
            e.preventDefault();
            if (typeof open === "function") {
              open();
            }
          }

          return (
            <button
              type="button"
              onClick={handleOnClick}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center dark:border-gray-700 hover:border-blue-500 transition cursor-pointer bg-gray-50/50 dark:bg-gray-900/30 active:scale-[0.98] touch-manipulation"
            >
              {value ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image
                    src={value}
                    alt="Uploaded Product"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 mb-3 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800 text-gray-600 dark:text-gray-300 pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 pointer-events-none">
                    <span className="font-semibold text-gray-800 dark:text-white">
                      Tap to upload
                    </span>{" "}
                    or pick from gallery
                  </p>
                </>
              )}
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}