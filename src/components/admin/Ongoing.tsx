"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Radio, ShieldAlert } from "lucide-react";
import { Panel, PanelUpdatedPayload } from "../../types/admin";
import PanelCard from "./PanelCard";

interface OngoingProps {
  apiUrl: string;
  authToken: string;
  livePanelUpdate?: PanelUpdatedPayload | null;
}

export default function Ongoing({ apiUrl, authToken, livePanelUpdate }: OngoingProps) {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPanels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/panels`, {
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPanels(data.data);
      } else {
        setError(data.message || "Failed to fetch panels");
      }
    } catch {
      setError("Network error fetching panels");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authToken]);

  useEffect(() => {
    fetchPanels();

    // Fallback polling interval (since Vercel Serverless doesn't support SSE)
    const intervalId = setInterval(() => {
      fetchPanels();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchPanels]);

  useEffect(() => {
    if (!livePanelUpdate) return;
    setPanels((prev) => {
      const idx = prev.findIndex((p) => p.id === livePanelUpdate.id);
      if (idx >= 0) {
        const newPanels = [...prev];
        newPanels[idx] = {
          ...newPanels[idx],
          status: livePanelUpdate.status,
          current_candidate_id: livePanelUpdate.current_candidate_id,
          candidate_name: livePanelUpdate.candidate_name,
        };
        return newPanels;
      } else if (livePanelUpdate.status === "ongoing") {
        // Newly ongoing panel
        return [...prev, {
          id: livePanelUpdate.id,
          room_id: livePanelUpdate.room_id,
          name: livePanelUpdate.name || "Unknown Panel",
          grid_position_x: 0,
          grid_position_y: 0,
          status: "ongoing",
          current_candidate_id: livePanelUpdate.current_candidate_id,
          candidate_name: livePanelUpdate.candidate_name,
        }];
      }
      return prev;
    });
  }, [livePanelUpdate]);

  const ongoingPanels = panels.filter((p) => p.status === "ongoing");

  const handleToggleStatus = async (panel: Panel) => {
    try {
      const newStatus = panel.status === "ongoing" ? "empty" : "ongoing";
      const payload: any = { status: newStatus };
      if (newStatus === "empty") {
        payload.current_candidate_id = null;
      }

      const res = await fetch(`${apiUrl}/api/panels/${panel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        fetchPanels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && panels.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Ongoing Interviews
            </p>
            <p className="mt-2 font-mono text-3xl font-bold text-cyan-500">
              {ongoingPanels.length}
            </p>
          </div>
          <div className="rounded-full bg-cyan-100 p-3 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400">
            <Radio size={24} />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {ongoingPanels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ongoingPanels.map((panel) => (
            <PanelCard
              key={panel.id}
              panel={panel}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center dark:border-gray-800 dark:bg-gray-900/50">
          <ShieldAlert className="mb-3 h-10 w-10 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No active interviews</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            There are currently no panels conducting interviews. Assign candidates from the Waiting Room to start.
          </p>
        </div>
      )}
    </div>
  );
}
