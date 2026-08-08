"use client";

import React from "react";
import { Edit, Trash2, User, UserCheck, Play, CheckCircle } from "lucide-react";
import { Panel } from "../../types/admin";

interface PanelCardProps {
  panel: Panel;
  onEdit: (panel: Panel) => void;
  onDelete: (panelId: number) => void;
  onAssignCandidate?: (panel: Panel) => void;
  onToggleStatus?: (panel: Panel) => void;
  isEditMode?: boolean;
  roomName?: string;
}

export default function PanelCard({ panel, onEdit, onDelete, onAssignCandidate, onToggleStatus, isEditMode, roomName }: PanelCardProps) {
  const isOngoing = panel.status === "ongoing";

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 ${
        isOngoing
          ? "border-2 border-cyan-400 bg-cyan-950/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)] dark:border-cyan-400 dark:bg-cyan-950/40"
          : "border border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:border-gray-700"
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-conthrax text-sm font-semibold tracking-wide text-gray-900 dark:text-white">
            {panel.name}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              isOngoing
                ? "border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                : "border border-gray-300 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {isOngoing ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Ongoing
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                Empty
              </>
            )}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400">
          <p>Grid: ({panel.grid_position_x}, {panel.grid_position_y})</p>
          {roomName && <p>Room: {roomName}</p>}
        </div>

        {/* Candidate Info Box */}
        <div
          className={`mt-3 rounded-lg p-3 ${
            isOngoing
              ? "border border-cyan-500/30 bg-cyan-900/30 dark:bg-cyan-950/60"
              : "border border-gray-100 bg-gray-50 dark:border-gray-800/80 dark:bg-gray-950/50"
          }`}
        >
          {panel.current_candidate_id ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <User size={13} className={isOngoing ? "text-cyan-400" : "text-gray-400"} />
                <span>Assigned Candidate</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {panel.candidate_name || `Candidate #${panel.current_candidate_id}`}
              </p>
              {panel.candidate_roll && (
                <p className="font-mono text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
                  {panel.candidate_roll}
                </p>
              )}
              <p className="font-mono text-[11px] text-gray-400">
                ID: #{panel.current_candidate_id}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-1 text-xs text-gray-400">
              <UserCheck size={14} className="text-gray-400" />
              <span>No candidate assigned</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800/60">
        {onToggleStatus && (
          <button
            type="button"
            onClick={() => onToggleStatus(panel)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            {isOngoing ? <CheckCircle size={13} className="text-gray-400" /> : <Play size={13} className="text-cyan-500" />}
            {isOngoing ? "Mark as Empty" : "Start Ongoing"}
          </button>
        )}
        {onAssignCandidate && (
          <button
            type="button"
            onClick={() => onAssignCandidate(panel)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isOngoing ? <CheckCircle size={13} /> : <Play size={13} />}
            {isOngoing ? "Change" : "Assign"}
          </button>
        )}
        {isEditMode && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(panel)}
              title="Edit Panel"
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Edit size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(panel.id)}
              title="Delete Panel"
              className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
