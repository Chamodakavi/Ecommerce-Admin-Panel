"use client";

import React from "react";
import { GeneralConfig } from "./types";

interface AnnouncementTabProps {
  generalConfig: GeneralConfig;
  setGeneralConfig: React.Dispatch<React.SetStateAction<GeneralConfig>>;
}

export default function AnnouncementTab({ generalConfig, setGeneralConfig }: AnnouncementTabProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold">Announcement Banner</h2>
      <div className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Banner Text</label>
          <input
            type="text"
            value={generalConfig.announcementText}
            onChange={(e) =>
              setGeneralConfig({ ...generalConfig, announcementText: e.target.value })
            }
            className="w-full text-xs px-3.5 py-2.5 border rounded-lg bg-white border-slate-200 focus:outline-indigo-500"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={generalConfig.isAnnouncementActive}
            onChange={(e) =>
              setGeneralConfig({ ...generalConfig, isAnnouncementActive: e.target.checked })
            }
            className="rounded text-indigo-600"
          />
          Show Announcement Bar on top of site
        </label>
      </div>
    </div>
  );
}