"use client";

import React, { useState, useEffect } from "react";
import { Search, User, CheckCircle2, Plus, X } from "lucide-react";
import { Registration, Criterion, InterviewSubmission } from "../../types/evaluation";
import { PanelUpdatedPayload } from "../../types/admin";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

interface EvaluationFormProps {
  password: string;
  role: string;
  panelistName: string;
  panelistRoll: string;
  livePanelUpdate?: PanelUpdatedPayload | null;
}

export default function EvaluationForm({ password, role, panelistName, panelistRoll, livePanelUpdate }: EvaluationFormProps) {
  const [rollNumber, setRollNumber] = useState("");
  const [candidate, setCandidate] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [remarks, setRemarks] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-populate when an admin assigns a candidate to a panel that matches this panelist's role
  useEffect(() => {
    if (livePanelUpdate && livePanelUpdate.status === "ongoing" && livePanelUpdate.current_candidate_id) {
      // If the panel name matches the panelist's role, or we just want to load it
      // Let's fetch the candidate by ID and if it matches domain, we set it.
      // Wait, since admin assigned it to the panel, if the panel matches role:
      if (livePanelUpdate.name === role) {
        fetchCandidateById(livePanelUpdate.current_candidate_id);
      }
    }
  }, [livePanelUpdate]);

  const fetchCandidateById = async (id: number | string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`${API}/api/registration/${id}`, {
        headers: {
          Authorization: password,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load assigned candidate");
      }
      const data = await res.json();
      if (data.success && data.data) {
        setCandidate(data.data);
        setRollNumber(data.data.roll_number || "");
        setupCriteria(data.data.domain_choice);
      } else {
        setError(data.message || "Assigned candidate not found");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const searchCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError("");
    setCandidate(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API}/api/registration/by-roll/${rollNumber.trim()}`, {
        headers: {
          Authorization: password,
        },
      });

      if (!res.ok) {
        throw new Error("Candidate not found or unauthorized");
      }
      const data = await res.json();
      if (data.success && data.data) {
        setCandidate(data.data);
        setupCriteria(data.data.domain_choice);
      } else {
        setError(data.message || "Candidate not found");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const setupCriteria = (domainChoice: string) => {
    const domain = domainChoice.toLowerCase();
    let initialCriteria: Criterion[] = [];

    if (domain.includes("tech") || domain.includes("web") || domain.includes("app")) {
      initialCriteria = [
        { name: "Technical Skills", max_score: 10, score: 0 },
        { name: "Problem Solving", max_score: 10, score: 0 },
        { name: "Communication", max_score: 10, score: 0 },
      ];
    } else if (domain.includes("design") || domain.includes("ui")) {
      initialCriteria = [
        { name: "Design Thinking", max_score: 10, score: 0 },
        { name: "Portfolio / Past Work", max_score: 10, score: 0 },
        { name: "Communication", max_score: 10, score: 0 },
      ];
    } else if (domain.includes("marketing") || domain.includes("pr")) {
      initialCriteria = [
        { name: "Communication", max_score: 10, score: 0 },
        { name: "Creativity", max_score: 10, score: 0 },
        { name: "Confidence", max_score: 10, score: 0 },
      ];
    } else {
      initialCriteria = [
        { name: "General Aptitude", max_score: 10, score: 0 },
        { name: "Communication", max_score: 10, score: 0 },
      ];
    }
    setCriteria(initialCriteria);
    setRemarks("");
  };

  const addCriterion = () => {
    setCriteria([...criteria, { name: "", max_score: 10, score: 0 }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (index: number, field: keyof Criterion, value: string | number) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setCriteria(newCriteria);
  };

  const submitEvaluation = async () => {
    if (!candidate) return;
    
    if (criteria.some((c) => !c.name.trim())) {
      setError("Give each criterion a name");
      return;
    }
    if (criteria.some((c) => c.max_score <= 0)) {
      setError("Each criterion needs max marks > 0");
      return;
    }

    setSubmitting(true);
    setError("");

    const submission: InterviewSubmission = {
      registration_id: candidate.id,
      panelist_name: panelistName,
      panelist_roll: panelistRoll,
      panelist_branch: "N/A", // From login?
      panelist_domain: role,
      remarks: remarks.trim(),
      criteria: criteria,
    };

    try {
      const res = await fetch(`${API}/api/interviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify(submission),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit evaluation");
      }

      setSuccess(true);
      setCandidate(null);
      setRollNumber("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-bold">Search Candidate</h2>
        <form onSubmit={searchCandidate} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter Roll Number..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !rollNumber}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 size={20} />
            <p>Evaluation submitted successfully!</p>
          </div>
        )}
      </div>

      {candidate && (
        <div className="space-y-6">
          {/* Candidate Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4 dark:border-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{candidate.full_name}</h3>
                <p className="text-sm text-gray-500">{candidate.email}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Roll Number</p>
                <p className="font-medium">{candidate.roll_number}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Branch</p>
                <p className="font-medium">{candidate.branch}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Domain Choice</p>
                <p className="font-medium">{candidate.domain_choice}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Gender</p>
                <p className="font-medium">{candidate.gender}</p>
              </div>
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Evaluation Criteria</h3>
              <button
                onClick={addCriterion}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Plus size={16} /> Add Criterion
              </button>
            </div>

            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-500">Criterion Name</label>
                    <input
                      type="text"
                      value={criterion.name}
                      onChange={(e) => handleCriterionChange(index, "name", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none dark:border-gray-700 dark:bg-gray-950"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs text-gray-500">Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={criterion.max_score}
                      onChange={(e) => handleCriterionChange(index, "max_score", parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none dark:border-gray-700 dark:bg-gray-950"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs text-gray-500">Score</label>
                    <input
                      type="number"
                      min="0"
                      max={criterion.max_score}
                      value={criterion.score}
                      onChange={(e) => handleCriterionChange(index, "score", parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 outline-none dark:border-gray-700 dark:bg-gray-950"
                    />
                  </div>
                  <button
                    onClick={() => removeCriterion(index)}
                    className="mt-4 rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 sm:mt-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
              <label className="mb-2 block font-medium">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950"
                placeholder="Enter any additional remarks..."
              />
            </div>

            <button
              onClick={submitEvaluation}
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-cyan-500 px-6 py-4 font-bold text-gray-900 transition-all hover:bg-cyan-400 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
