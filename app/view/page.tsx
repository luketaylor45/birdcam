"use client";

import { useEffect, useState, useMemo } from "react";
import VideoPlayer from "../components/VideoPlayer";

interface Clip {
    name: string;
    hasMotion: boolean;
}

const formatClipTime = (filename: string) => {
    const name = filename.replace(".mp4", "");
    const match = name.match(/^(\d{2})[-.](\d{2})[-.](\d{2})$/);

    if (match) {
        const [_, hours, minutes, seconds] = match;
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    }

    if (/^\d{2}[-.]\d{2}[-.]\d{2}$/.test(name)) {
        return name.replace(/[-.]/g, ":");
    }
    return name;
};

export default function BirdcamArchive() {
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [clips, setClips] = useState<Clip[]>([]); // Array of Clip objects
    const [activeClip, setActiveClip] = useState<Clip | null>(null);

    // Fetch dates
    useEffect(() => {
        fetch("/api/dates")
            .then(res => res.json())
            .then(data => {
                setDates(data);
                if (data.length > 0) setSelectedDate(data[0]);
            });
    }, []);

    // Fetch clips
    useEffect(() => {
        if (!selectedDate) return;
        setClips([]);
        setActiveClip(null);

        fetch(`/api/clips?date=${selectedDate}`)
            .then(res => res.json())
            .then((data: Clip[]) => {
                setClips(data);
            });
    }, [selectedDate]);

    const activeClipUrl = useMemo(() => {
        if (!selectedDate || !activeClip) return null;
        return `https://api.birdcam.tayr.dev/archive/${selectedDate}/${activeClip.name}`;
    }, [selectedDate, activeClip]);

    const videoOptions = useMemo(() => ({
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: activeClipUrl ? [{
            src: activeClipUrl,
            type: "video/mp4"
        }] : [],
    }), [activeClipUrl]);

    return (
        <div className="flex flex-col lg:h-[calc(100vh-8rem)]">
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Main Player Area */}
                <div className="lg:col-span-3 flex flex-col space-y-4">
                    <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative aspect-video flex items-center justify-center">
                        {activeClipUrl ? (
                            <VideoPlayer key={activeClipUrl} options={videoOptions} />
                        ) : (
                            <div className="text-neutral-500">
                                {clips.length === 0 && selectedDate ? "No clips for this date" : "Select a clip to play"}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-medium text-white tracking-tight flex items-center gap-2">
                            {activeClip ? formatClipTime(activeClip.name) : "Waiting for selection..."}
                            {activeClip?.hasMotion && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400 border border-red-800/50">
                                    Motion Detected
                                </span>
                            )}
                        </h2>
                        <span className="text-neutral-500 text-sm font-mono bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
                            {selectedDate}
                        </span>
                    </div>
                </div>

                {/* Sidebar (Date & Clip list) */}
                <div className="lg:col-span-1 flex flex-col space-y-4 bg-neutral-900/40 backdrop-blur-sm rounded-xl border border-neutral-800 p-4 h-[600px] lg:h-full overflow-hidden">

                    {/* Date Selector */}
                    <div>
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                            Select Date
                        </label>
                        <div className="relative">
                            <select
                                className="appearance-none w-full bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none cursor-pointer hover:border-neutral-600"
                                value={selectedDate || ""}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            >
                                {dates.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Clip List */}
                    <div className="flex-1 flex flex-col min-h-0 mt-4">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                            Timeline
                        </label>

                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                            {clips.length === 0 && (
                                <div className="text-neutral-500 text-sm py-4 text-center border border-dashed border-neutral-800 rounded-lg">
                                    No recordings found
                                </div>
                            )}

                            <div className="relative border-l border-neutral-800 ml-3 space-y-0.5">
                                {clips.map((clip) => {
                                    const isActive = activeClip?.name === clip.name;
                                    return (
                                        <button
                                            key={clip.name}
                                            onClick={() => setActiveClip(clip)}
                                            className={`group relative w-full text-left pl-6 pr-3 py-3 text-sm transition-all duration-200 ${isActive
                                                ? "text-emerald-400 bg-emerald-500/5 rounded-r-lg"
                                                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30 rounded-r-lg"
                                                }`}
                                        >
                                            {/* Dot on the line */}
                                            <span className={`absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-[2px] transition-colors duration-200 ${isActive
                                                ? "bg-neutral-950 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                                : clip.hasMotion
                                                    ? "bg-red-500 border-red-500 group-hover:border-red-400 z-10" // Red dot for motion
                                                    : "bg-neutral-900 border-neutral-700 group-hover:border-neutral-500"
                                                }`}></span>

                                            <div className="flex items-center justify-between">
                                                <span className="font-mono tracking-tight">{formatClipTime(clip.name)}</span>

                                                <div className="flex items-center space-x-2">
                                                    {/* Motion Icon */}
                                                    {clip.hasMotion && !isActive && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" title="Motion Detected"></div>
                                                    )}

                                                    {/* Active Pulse */}
                                                    {isActive && (
                                                        <span className="flex h-2 w-2 relative">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
