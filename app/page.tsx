"use client";

import VideoPlayer from "./components/VideoPlayer";

export default function BirdcamLive() {
    const videoOptions = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
            src: "https://api.birdcam.tayr.dev/live/stream.m3u8",
            type: "application/x-mpegURL"
        }],
        liveui: true,
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Live Feed</h1>
                <p className="text-neutral-400">Real-time view from the garden.</p>
            </div>

            <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-neutral-800 bg-neutral-900">
                <VideoPlayer options={videoOptions} />
            </div>

            <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span>Status: Online</span>
            </div>
        </div>
    );
}
