"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Plus,
  Grid,
  RefreshCw,
  Building,
  MapPin,
  X,
  Layers,
  SlidersHorizontal,
  Trash2,
  Settings,
} from "lucide-react";
import { Room, Panel, PanelUpdatedPayload } from "../../types/admin";
import PanelCard from "./PanelCard";

interface RoomBuilderProps {
  apiUrl: string;
  authToken: string;
  livePanelUpdate?: PanelUpdatedPayload | null;
  panelistRole?: string;
}

const AVAILABLE_PANEL_ROLES = [
  "Internship: General Member",
  "Internship: Management",
  "Higher: General Member",
  "Higher: Management",
  "Events: General Member",
  "Events: Marketing",
  "Events: Photography and videograph",
  "Projects: Mentors",
  "Projects: Management",
  "Projects: General Member",
  "Projects: AI/ML",
  "Projects: Data Analyst",
  "Projects: IoT",
  "Projects: Linux",
  "Projects: Java",
  "Projects: Blockchain",
  "Projects: Web Development",
  "Projects: Data Analytics",
  "Training: General Member",
  "Training: App Development",
  "Training: Web Development",
  "Training: Game Development",
  "Training: Design & UI/UX",
  "Training: Cyber Security",
  "Training: DSA&CP",
  "Training: Java",
  "Training: AI/ML",
  "Training: Data Analytics",
  "Research: Medical Imaging",
  "Research: Deep learning/ Machine learning",
  "Research: Astronomy/Space technology",
  "Research: Defence technology",
  "Research: Game theory",
  "Research: Finance and Economics",
  "Research: Quantum",
  "Research: Bio-Tech",
  "Finance: General Member",
  "Finance: Management",
  "Office: OSG",
  "Office: OTI",
  "Office: OCD",
  "Office: OPCR",
  "Office: OCA",
  "Office: OCC"
];

interface RoomWithPanels extends Room {
  panels: Panel[];
  gridDimensions: { rows: number; cols: number };
}

export default function RoomBuilder({ apiUrl, authToken, livePanelUpdate, panelistRole }: RoomBuilderProps) {
  const [rooms, setRooms] = useState<RoomWithPanels[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);

  // Modal States
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomLocation, setNewRoomLocation] = useState("");

  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [panelForm, setPanelForm] = useState({
    name: "",
    grid_position_x: 0,
    grid_position_y: 0,
    status: "empty",
    current_candidate_id: "",
  });

  // Calculate unallocated roles
  const allocatedRoles = useMemo(() => {
    return rooms.flatMap(r => r.panels.map(p => p.name));
  }, [rooms]);

  const unallocatedRoles = useMemo(() => {
    return AVAILABLE_PANEL_ROLES.filter(r => !allocatedRoles.includes(r)).sort();
  }, [allocatedRoles]);

  // Fetch Rooms & Panels
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/rooms`, {
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const baseRooms: Room[] = data.data;
        
        // Fetch panels for each room
        const roomsWithPanels: RoomWithPanels[] = await Promise.all(
          baseRooms.map(async (r) => {
            try {
              const pRes = await fetch(`${apiUrl}/api/rooms/${r.id}`, { headers: { Authorization: authToken }});
              const pData = await pRes.json();
              const panels: Panel[] = (pData.success && pData.data.panels) ? pData.data.panels : [];
              
              let maxRow = 3;
              let maxCol = 3;
              panels.forEach((p) => {
                if (p.grid_position_y > maxRow) maxRow = p.grid_position_y;
                if (p.grid_position_x > maxCol) maxCol = p.grid_position_x;
              });
              
              return { ...r, panels, gridDimensions: { rows: maxRow + 1, cols: maxCol + 1 } };
            } catch {
              return { ...r, panels: [], gridDimensions: { rows: 4, cols: 4 } };
            }
          })
        );
        // Apply Panelist Filtering logic
        if (panelistRole) {
          const searchPhrase = (panelistRole.split(":")[1] || panelistRole).trim().toLowerCase();
          const shortToLong: Record<string, string> = {
            "osg": "office of strategy & growth",
            "oti": "office of technology & innovation",
            "ocd": "office of creativity & design",
            "opcr": "office of public & corporate relations",
            "oca": "office of campus ambassadors",
            "occ": "office of content & communications",
          };
          const mappedSearchPhrase = shortToLong[searchPhrase] || searchPhrase;

          const filteredRooms = roomsWithPanels.map((room) => {
            const matchingPanels = room.panels.filter((p) => {
              if (p.name === panelistRole) return true;
              if (!p.name.includes(":")) {
                return p.name.toLowerCase().includes(mappedSearchPhrase) || mappedSearchPhrase.includes(p.name.toLowerCase());
              }
              return false;
            });
            return { ...room, panels: matchingPanels };
          }).filter((room) => room.panels.length > 0); // Hide rooms that don't have this panelist's panels
          
          setRooms(filteredRooms);
        } else {
          setRooms(roomsWithPanels);
        }
      } else {
        setError(data.message || "Failed to load rooms");
      }
    } catch {
      setError("Unable to connect to rooms server");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authToken]);

  useEffect(() => {
    fetchAllData();

    // Fallback polling interval (since Vercel Serverless doesn't support SSE)
    const intervalId = setInterval(() => {
      fetchAllData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first user interaction to bypass autoplay policies
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };
    
    document.addEventListener("click", initAudio);
    return () => document.removeEventListener("click", initAudio);
  }, []);

  // Helper to play a tone reliably
  const playTone = useCallback((status: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = audioCtxRef.current || new AudioContext();
      if (!audioCtxRef.current) audioCtxRef.current = ctx;
      
      if (ctx.state === "suspended") ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(status === "ongoing" ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Could not play audio tone", e);
    }
  }, []);

  // Handle SSE Live Panel Update
  useEffect(() => {
    if (!livePanelUpdate) return;
    
    // Play tone for incoming updates
    playTone(livePanelUpdate.status);

    setRooms((prevRooms) => {
      return prevRooms.map((r) => {
        if (r.id === livePanelUpdate.room_id) {
          const newPanels = [...r.panels];
          const index = newPanels.findIndex((p) => p.id === livePanelUpdate.id);
          const updatedPanel: Panel = {
            id: livePanelUpdate.id,
            room_id: livePanelUpdate.room_id,
            name: livePanelUpdate.name,
            grid_position_x: livePanelUpdate.grid_position_x,
            grid_position_y: livePanelUpdate.grid_position_y,
            status: livePanelUpdate.status,
            current_candidate_id: livePanelUpdate.current_candidate_id,
            candidate_name: livePanelUpdate.candidate_name,
            updated_at: livePanelUpdate.updated_at,
          };
          
          if (index >= 0) {
            newPanels[index] = updatedPanel;
          } else {
            newPanels.push(updatedPanel);
          }
          
          let maxRow = r.gridDimensions.rows - 1;
          let maxCol = r.gridDimensions.cols - 1;
          newPanels.forEach((p) => {
            if (p.grid_position_y > maxRow) maxRow = p.grid_position_y;
            if (p.grid_position_x > maxCol) maxCol = p.grid_position_x;
          });

          // If panelistRole is set, only update if the new panel belongs to the panelist
          if (panelistRole) {
            const searchPhrase = (panelistRole.split(":")[1] || panelistRole).trim().toLowerCase();
            const shortToLong: Record<string, string> = {
              "osg": "office of strategy & growth",
              "oti": "office of technology & innovation",
              "ocd": "office of creativity & design",
              "opcr": "office of public & corporate relations",
              "oca": "office of campus ambassadors",
              "occ": "office of content & communications",
            };
            const mappedSearchPhrase = shortToLong[searchPhrase] || searchPhrase;
            
            const matchingPanels = newPanels.filter((p) => {
              if (p.name === panelistRole) return true;
              if (!p.name.includes(":")) {
                return p.name.toLowerCase().includes(mappedSearchPhrase) || mappedSearchPhrase.includes(p.name.toLowerCase());
              }
              return false;
            });
            return { ...r, panels: matchingPanels, gridDimensions: { rows: maxRow + 1, cols: maxCol + 1 } };
          }

          return { ...r, panels: newPanels, gridDimensions: { rows: maxRow + 1, cols: maxCol + 1 } };
        }
        return r;
      });
    });
  }, [livePanelUpdate]);

  // Create Room handler
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          name: newRoomName.trim(),
          location: newRoomLocation.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSuccessMessage(`Room "${data.data.name}" created successfully.`);
        setIsRoomModalOpen(false);
        setNewRoomName("");
        setNewRoomLocation("");
        fetchAllData();
      } else {
        setError(data.message || "Failed to create room.");
      }
    } catch {
      setError("Error sending room creation request.");
    }
  };

  // Open Create Panel Modal for specific cell
  const handleOpenAddPanel = (roomId: number, x: number, y: number) => {
    setActiveRoomId(roomId);
    setEditingPanel(null);
    
    setPanelForm({
      name: "",
      grid_position_x: x,
      grid_position_y: y,
      status: "empty",
      current_candidate_id: "",
    });
    setIsPanelModalOpen(true);
  };

  // Open Edit Panel Modal
  const handleOpenEditPanel = (roomId: number, panel: Panel) => {
    setActiveRoomId(roomId);
    setEditingPanel(panel);
    setPanelForm({
      name: panel.name,
      grid_position_x: panel.grid_position_x,
      grid_position_y: panel.grid_position_y,
      status: panel.status,
      current_candidate_id: panel.current_candidate_id ? String(panel.current_candidate_id) : "",
    });
    setIsPanelModalOpen(true);
  };

  // Save Panel (Create or Edit)
  const handleSavePanel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId || !panelForm.name.trim()) return;

    const candidateId = panelForm.current_candidate_id ? Number(panelForm.current_candidate_id) : null;
    const bodyPayload = {
      room_id: activeRoomId,
      name: panelForm.name.trim(),
      grid_position_x: Number(panelForm.grid_position_x),
      grid_position_y: Number(panelForm.grid_position_y),
      status: panelForm.status,
      current_candidate_id: candidateId,
    };

    try {
      let res;
      if (editingPanel) {
        res = await fetch(`${apiUrl}/api/panels/${editingPanel.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: authToken },
          body: JSON.stringify(bodyPayload),
        });
      } else {
        res = await fetch(`${apiUrl}/api/panels`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authToken },
          body: JSON.stringify(bodyPayload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Panel ${editingPanel ? "updated" : "created"} successfully.`);
        setIsPanelModalOpen(false);
        fetchAllData();
      } else {
        setError(data.message || "Failed to save panel.");
      }
    } catch {
      setError("Network error saving panel.");
    }
  };

  // Delete Panel handler
  const handleDeletePanel = async (panelId: number) => {
    if (!confirm("Are you sure you want to delete this panel?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/panels/${panelId}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Panel deleted successfully.");
        fetchAllData();
      } else {
        setError(data.message || "Failed to delete panel.");
      }
    } catch {
      setError("Network error deleting panel.");
    }
  };

  // Toggle Panel Status handler (View Mode)
  const handleTogglePanelStatus = async (panel: Panel) => {
    const newStatus = panel.status === "empty" ? "ongoing" : "empty";
    
    // Optimistically play tone on user click
    playTone(newStatus);
    
    try {
      const res = await fetch(`${apiUrl}/api/panels/${panel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: authToken },
        body: JSON.stringify({
          room_id: panel.room_id,
          name: panel.name,
          grid_position_x: panel.grid_position_x,
          grid_position_y: panel.grid_position_y,
          status: newStatus,
          current_candidate_id: panel.current_candidate_id || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      } else {
        setError(data.message || "Failed to toggle panel status.");
      }
    } catch {
      setError("Network error toggling panel status.");
    }
  };

  // Delete Room handler
  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this entire room?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Room deleted successfully.");
        fetchAllData();
      } else {
        setError(data.message || "Failed to delete room.");
      }
    } catch {
      setError("Network error deleting room.");
    }
  };

  // Modify Matrix Dimensions
  const setRoomGridDimensions = (roomId: number, rows: number, cols: number) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, gridDimensions: { rows, cols } } : r));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Panel Rooms Overview</h2>
        </div>
        <div className="flex items-center gap-3">
          {!panelistRole && (
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isEditMode
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Settings size={14} />
              {isEditMode ? "Exit Edit Mode" : "Edit Rooms"}
            </button>
          )}
          
          <button
            type="button"
            onClick={fetchAllData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          
          {isEditMode && (
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-95"
            >
              <Plus size={16} /> New Room
            </button>
          )}
        </div>
      </div>

      {/* Notifications / Feedback Messages */}
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {rooms.length === 0 && !loading ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-800">
          <Grid className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">No Rooms Created</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a new room to start configuring interview panels.
          </p>
          <button
            type="button"
            onClick={() => setIsRoomModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} /> Create Room Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {rooms.map((room) => {
            const panelGridMap = new Map<string, Panel>();
            room.panels.forEach((p) => {
              panelGridMap.set(`${p.grid_position_x},${p.grid_position_y}`, p);
            });

            return (
              <div key={room.id} className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                
                {/* Room Header Banner */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-conthrax text-lg font-bold tracking-wide text-gray-900 dark:text-cyan-400">
                        {room.name}
                      </h2>
                    </div>
                    {room.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin size={13} /> {room.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        title="Delete Room"
                        className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid Header & Select */}
                <div className="px-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-4">
                       <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                         Total Panels: <span className="text-gray-900 dark:text-white">{room.panels.length}</span>
                       </span>
                       <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                         Ongoing: <span className="text-emerald-600 dark:text-emerald-400">{room.panels.filter(p => p.status === "ongoing").length}</span>
                       </span>
                    </div>
                    {isEditMode && (
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <SlidersHorizontal size={14} />
                        <select
                          value={`${room.gridDimensions.rows}x${room.gridDimensions.cols}`}
                          onChange={(e) => {
                            const [r, c] = e.target.value.split("x").map(Number);
                            setRoomGridDimensions(room.id, r, c);
                          }}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="2x2">2 x 2 Matrix</option>
                          <option value="3x3">3 x 3 Matrix</option>
                          <option value="4x4">4 x 4 Matrix</option>
                          <option value="5x5">5 x 5 Matrix</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Grid Layout */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60 mb-5 overflow-auto">
                    <div
                      className="grid gap-3 min-w-max"
                      style={{
                        gridTemplateColumns: `repeat(${room.gridDimensions.cols}, minmax(180px, 1fr))`,
                      }}
                    >
                      {Array.from({ length: room.gridDimensions.rows }).map((_, rIndex) =>
                        Array.from({ length: room.gridDimensions.cols }).map((_, cIndex) => {
                          const cellKey = `${cIndex},${rIndex}`;
                          const panel = panelGridMap.get(cellKey);

                          if (panel) {
                            return (
                              <PanelCard
                                key={panel.id}
                                panel={panel}
                                onEdit={(p) => handleOpenEditPanel(room.id, p)}
                                onDelete={handleDeletePanel}
                                onToggleStatus={handleTogglePanelStatus}
                                isEditMode={isEditMode}
                              />
                            );
                          }

                          if (!isEditMode) return null; // Collapse empty spaces in view mode
                          return (
                            <button
                              key={cellKey}
                              type="button"
                              onClick={() => handleOpenAddPanel(room.id, cIndex, rIndex)}
                              className="group flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 p-3 transition-all duration-200 hover:border-cyan-500 hover:bg-cyan-50/50 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-cyan-500/70 dark:hover:bg-cyan-950/20"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:bg-cyan-500 group-hover:text-white dark:bg-gray-800">
                                <Plus size={16} />
                              </div>
                              <span className="mt-2 text-xs font-semibold text-gray-500 group-hover:text-cyan-600 dark:text-gray-400 dark:group-hover:text-cyan-400">
                                Add Panel
                              </span>
                              <span className="mt-1 font-mono text-[10px] text-gray-400">
                                Col {cIndex}, Row {rIndex}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create Room */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Interview Room</h3>
              <button
                type="button"
                onClick={() => setIsRoomModalOpen(false)}
                className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Campus Hall A"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location / Floor
                </label>
                <input
                  type="text"
                  value={newRoomLocation}
                  onChange={(e) => setNewRoomLocation(e.target.value)}
                  placeholder="e.g. Building 3, 2nd Floor"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Panel */}
      {isPanelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingPanel ? "Edit Panel Details" : "Create New Panel"}
              </h3>
              <button
                type="button"
                onClick={() => setIsPanelModalOpen(false)}
                className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePanel} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Panel Role *
                </label>
                <select
                  required
                  value={panelForm.name}
                  onChange={(e) => setPanelForm({ ...panelForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="" disabled>Select an unallocated role...</option>
                  {editingPanel && !unallocatedRoles.includes(editingPanel.name) && (
                    <option value={editingPanel.name}>{editingPanel.name}</option>
                  )}
                  {unallocatedRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grid Position X (Col)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={panelForm.grid_position_x}
                    onChange={(e) => setPanelForm({ ...panelForm, grid_position_x: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grid Position Y (Row)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={panelForm.grid_position_y}
                    onChange={(e) => setPanelForm({ ...panelForm, grid_position_y: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Panel Status
                </label>
                <select
                  value={panelForm.status}
                  onChange={(e) => setPanelForm({ ...panelForm, status: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="empty">Empty (Available)</option>
                  <option value="ongoing">Ongoing (In Progress)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Candidate ID (Optional)
                </label>
                <input
                  type="number"
                  value={panelForm.current_candidate_id}
                  onChange={(e) => setPanelForm({ ...panelForm, current_candidate_id: e.target.value })}
                  placeholder="Enter candidate registration ID"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsPanelModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingPanel ? "Save Changes" : "Add Panel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
