"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { domains } from "../../data/domain";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

type Registration = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  kiit_email: string;
  gender: string;
  roll_number: string;
  academic_year: string;
  course: string;
  branch: string;
  domain_choice: string;
  motivation: string;
  experience: string;
  skills: string[];
  referral_source: string;
  status: string;
  created_at: string;
};

type Criterion = {
  name: string;
  max_score: number;
  score: number;
};

type Interview = {
  id: number;
  registration_id: number;
  panelist_name: string;
  panelist_roll: string;
  panelist_branch: string;
  panelist_domain: string;
  marks: number | null;
  remarks: string;
  status: string;
  created_at: string;
  full_name: string;
  email: string;
  roll_number: string;
  domain_choice: string;
  criteria?: Criterion[];
};

const domainLabels: Record<string, string> = {};
for (const d of domains) domainLabels[d.key] = d.title;
domainLabels["osg"] = "Office of the Secretary General";
domainLabels["oti"] = "Office of Technical Infrastructure";
domainLabels["ocd"] = "Office of Creativity & Design";
domainLabels["opcr"] = "Office of Public & Corporate Relations";
domainLabels["oca"] = "Office of Campus Ambassadors";
domainLabels["occ"] = "Office of Content & Communications";
domainLabels["relations"] = "Office of Public & Corporate Relations";
domainLabels["creative"] = "Office of Creativity & Design";
domainLabels["comms"] = "Office of Content & Communications";

type Tab = "registrations" | "interviews";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Registration[] | null>(null);
  const [interviews, setInterviews] = useState<Interview[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("registrations");

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  const fetchData = async (t: Tab) => {
    setLoading(true);
    setError("");
    setTab(t);
    try {
      if (t === "registrations") {
        const res = await fetch(`${API}/api/admin/registrations`, {
          headers: { Authorization: password },
        });
        const json = await res.json();
        if (!json.success) { setError(json.message || "Failed"); setData(null); }
        else { setData(json.data); }
      } else {
        const res = await fetch(`${API}/api/interviews/with-registration?password=${encodeURIComponent(password)}`);
        const json = await res.json();
        if (!json.success) { setError(json.message || "Failed"); setInterviews(null); }
        else { setInterviews(json.data); }
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(tab);
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((r) => {
      if (q && !r.full_name.toLowerCase().includes(q) && !r.kiit_email?.toLowerCase().includes(q) && !r.phone.includes(q)) return false;
      if (domainFilter && !r.domain_choice.split(",").includes(domainFilter)) return false;
      return true;
    });
  }, [data, search, domainFilter]);

  const filteredInterviews = useMemo(() => {
    if (!interviews) return [];
    const q = search.toLowerCase();
    return interviews.filter((iv) => {
      if (q && !iv.full_name?.toLowerCase().includes(q) && !iv.panelist_name?.toLowerCase().includes(q) && !iv.panelist_roll?.toLowerCase().includes(q)) return false;
      if (domainFilter && !iv.domain_choice.split(",").includes(domainFilter)) return false;
      return true;
    });
  }, [interviews, search, domainFilter]);

  const domainSet = useMemo(() => {
    if (!data) return [];
    const keys = new Set(data.map((r) => r.domain_choice));
    return Array.from(keys).sort();
  }, [data]);

  const interviewDomainSet = useMemo(() => {
    if (!interviews) return [];
    const keys = new Set(interviews.map((iv) => iv.domain_choice));
    return Array.from(keys).sort();
  }, [interviews]);

  const formatDate = (s: string) => new Date(s).toLocaleString();

  if (!data && !interviews) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Admin Panel</h1>

          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button type="button" onClick={() => setTab("registrations")} className={`flex-1 py-2 text-sm font-medium transition ${tab === "registrations" ? "bg-cyan-400 text-black" : "bg-[#1a1a2e] text-gray-400"}`}>Registrations</button>
            <button type="button" onClick={() => setTab("interviews")} className={`flex-1 py-2 text-sm font-medium transition ${tab === "interviews" ? "bg-cyan-400 text-black" : "bg-[#1a1a2e] text-gray-400"}`}>Interviews</button>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white outline-none focus:border-cyan-400 transition"
          />
          <button type="submit" disabled={loading || !password} className="w-full py-3 rounded-lg bg-cyan-400 text-black font-bold hover:bg-cyan-300 disabled:opacity-50 transition">
            {loading ? "Loading..." : `View ${tab === "registrations" ? "Registrations" : "Interviews"}`}
          </button>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </form>
      </div>
    );
  }

  if (tab === "interviews") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <h1 className="text-xl md:text-2xl font-bold">Interviews</h1>
              <button onClick={() => fetchData("registrations")} className="text-sm text-gray-400 hover:text-white self-center ml-4 transition">Registrations</button>
            </div>
            <button onClick={() => { setInterviews(null); setSearch(""); setDomainFilter(""); }} className="text-sm text-gray-400 hover:text-white transition">← Back</button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by candidate name, panelist name, panelist roll..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm outline-none focus:border-cyan-400/50 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm outline-none focus:border-cyan-400/50 transition">
              <option value="">All Domains</option>
              {interviewDomainSet.map((k) => (
                <option key={k} value={k}>{domainLabels[k] || k}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a2e] text-left text-gray-300">
                  <th className="p-3 border-b border-gray-800 font-medium">ID</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Candidate</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Panelist</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Panelist Roll</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Branch</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Domain</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Marks</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Status</th>
                  <th className="p-3 border-b border-gray-800 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((iv) => (
                  <tr key={iv.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition">
                    <td className="p-3 text-gray-400">{iv.id}</td>
                    <td className="p-3 font-medium">{iv.full_name}</td>
                    <td className="p-3 text-gray-300">{iv.panelist_name}</td>
                    <td className="p-3 text-gray-400">{iv.panelist_roll}</td>
                    <td className="p-3 text-gray-300">{iv.panelist_branch}</td>
                    <td className="p-3 text-gray-300">{domainLabels[iv.domain_choice] || iv.domain_choice}</td>
                    <td className="p-3">
                      {iv.criteria && iv.criteria.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {iv.criteria.map((c, i) => (
                            <span key={i} className="text-xs text-gray-400">
                              {c.name}: <span className="text-white font-medium">{c.score}</span>/{c.max_score}
                            </span>
                          ))}
                          <span className="text-xs text-cyan-400 font-bold mt-0.5 border-t border-gray-700 pt-0.5">
                            Total: {iv.marks !== null ? iv.marks : "—"}
                          </span>
                        </div>
                      ) : (
                        iv.marks !== null ? iv.marks : "—"
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${iv.status === "completed" ? "bg-green-900/50 text-green-300" : "bg-yellow-900/50 text-yellow-300"}`}>
                        {iv.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{formatDate(iv.created_at)}</td>
                  </tr>
                ))}
                {filteredInterviews.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">No interviews match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-gray-500">{filteredInterviews.length} of {interviews?.length ?? 0} interview{(interviews?.length ?? 0) !== 1 ? "s" : ""}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <h1 className="text-xl md:text-2xl font-bold">Registrations</h1>
            <button onClick={() => fetchData("interviews")} className="text-sm text-gray-400 hover:text-white self-center ml-4 transition">Interviews</button>
          </div>
          <button onClick={() => { setData(null); setSearch(""); setDomainFilter(""); }} className="text-sm text-gray-400 hover:text-white transition">← Back</button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll, phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm outline-none focus:border-cyan-400/50 transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-gray-700 text-white text-sm outline-none focus:border-cyan-400/50 transition">
            <option value="">All Domains</option>
            {domainSet.map((k) => (
              <option key={k} value={k}>{domainLabels[k] || k}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a1a2e] text-left text-gray-300">
                <th className="p-3 border-b border-gray-800 font-medium">ID</th>
                <th className="p-3 border-b border-gray-800 font-medium">Name</th>
                <th className="p-3 border-b border-gray-800 font-medium">KIIT Email</th>
                <th className="p-3 border-b border-gray-800 font-medium">Domain</th>
                <th className="p-3 border-b border-gray-800 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition">
                  <td className="p-3 text-gray-400">{r.id}</td>
                  <td className="p-3 font-medium">{r.full_name}</td>
                  <td className="p-3 text-gray-300">{r.kiit_email}</td>
                  <td className="p-3 text-gray-300">
                    {r.domain_choice.split(",").map(d => domainLabels[d] || d).join(", ")}
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{formatDate(r.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No registrations match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-sm text-gray-500">{filtered.length} of {data?.length ?? 0} registration{(data?.length ?? 0) !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}
