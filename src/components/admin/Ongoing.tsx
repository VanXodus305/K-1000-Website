"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Radio, ShieldAlert } from "lucide-react";
import { Panel, PanelUpdatedPayload, Room } from "../../types/admin";
import PanelCard from "./PanelCard";

interface OngoingProps {
  apiUrl: string;
  authToken: string;
  livePanelUpdate?: PanelUpdatedPayload | null;
}

export default function Ongoing({ apiUrl, authToken, livePanelUpdate }: OngoingProps) {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [panelsRes, roomsRes] = await Promise.all([
        fetch(`${apiUrl}/api/panels`, { headers: { Authorization: authToken } }),
        fetch(`${apiUrl}/api/rooms`, { headers: { Authorization: authToken } }),
      ]);
      const panelsData = await panelsRes.json();
      const roomsData = await roomsRes.json();

      if (panelsData.success && Array.isArray(panelsData.data)) {
        setPanels(panelsData.data);
      } else {
        setError(panelsData.message || "Failed to fetch panels");
      }

      if (roomsData.success && Array.isArray(roomsData.data)) {
        setRooms(roomsData.data);
      }
    } catch {
      setError("Network error fetching data");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authToken]);

  useEffect(() => {
    fetchData();

    // Fallback polling interval (since Vercel Serverless doesn't support SSE)
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

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
    const newStatus = panel.status === "ongoing" ? "empty" : "ongoing";
    try {
      const res = await fetch(`${apiUrl}/api/panels/${panel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to update panel status");
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
        <div className="flex flex-col gap-4">
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
          
          {ongoingPanels.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Object.entries(
                ongoingPanels.reduce((acc, panel) => {
                  const domain = panel.name.split(":")[0]?.trim() || "Unknown";
                  acc[domain] = (acc[domain] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1]).map(([domain, count]) => (
                <div key={domain} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950/50">
                  <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400" title={domain}>
                    {domain}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-gray-900 dark:bg-white">{count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {ongoingPanels.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ongoingPanels.map((panel) => {
            const room = rooms.find(r => r.id === panel.room_id);
            return (
              <PanelCard
                key={panel.id}
                panel={panel}
                roomName={room?.name}
                onToggleStatus={handleToggleStatus}
              />
            );
          })}
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
