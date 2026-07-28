"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  CandidateStatusUpdatedPayload,
  PanelUpdatedPayload,
  SSEConnectionStatus,
  SSEStreamOptions,
} from "../types/admin";

const DEFAULT_API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export function useSSEStream(options: SSEStreamOptions = {}) {
  const { apiUrl = DEFAULT_API_URL, authToken, onCandidateStatusUpdated, onPanelUpdated } = options;

  const [status, setStatus] = useState<SSEConnectionStatus | "Polling">("Disconnected");
  const [lastCandidateStatusUpdate, setLastCandidateStatusUpdate] = useState<CandidateStatusUpdatedPayload | null>(null);
  const [lastPanelUpdate, setLastPanelUpdate] = useState<PanelUpdatedPayload | null>(null);

  const callbacksRef = useRef({ onCandidateStatusUpdated, onPanelUpdated });
  useEffect(() => {
    callbacksRef.current = { onCandidateStatusUpdated, onPanelUpdated };
  }, [onCandidateStatusUpdated, onPanelUpdated]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const baseUrl = apiUrl || (typeof window !== "undefined" ? window.location.origin : "");
    const streamUrl = `${baseUrl.replace(/\/+$/, "")}/api/events/stream${
      authToken ? `?token=${encodeURIComponent(authToken)}` : ""
    }`;

    queueMicrotask(() => {
      setStatus("Connecting");
    });

    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus("Connected");
        reconnectCountRef.current = 0;
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;

        // Vercel Serverless does not support standard Go SSE (returns 500 Streaming unsupported).
        // Fallback to Polling mode visually instead of showing Error.
        setStatus("Polling");
      };

      es.addEventListener("candidate_status_updated", (event: MessageEvent) => {
        try {
          const payload: CandidateStatusUpdatedPayload = JSON.parse(event.data);
          setLastCandidateStatusUpdate(payload);
          if (callbacksRef.current.onCandidateStatusUpdated) {
            callbacksRef.current.onCandidateStatusUpdated(payload);
          }
        } catch (err) {
          console.error("Failed to parse candidate_status_updated payload:", err);
        }
      });

      es.addEventListener("panel_updated", (event: MessageEvent) => {
        try {
          const payload: PanelUpdatedPayload = JSON.parse(event.data);
          setLastPanelUpdate(payload);
          if (callbacksRef.current.onPanelUpdated) {
            callbacksRef.current.onPanelUpdated(payload);
          }
        } catch (err) {
          console.error("Failed to parse panel_updated payload:", err);
        }
      });
    } catch (err) {
      console.error("Error establishing SSE connection:", err);
      queueMicrotask(() => {
        setStatus("Error");
      });
    }
  }, [apiUrl, authToken]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  return {
    status: status as any,
    lastCandidateStatusUpdate,
    lastPanelUpdate,
    reconnect,
  };
}
