"use client";
import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";

interface VideoPlayerProps {
    options: any;
    onReady?: (player: Player) => void;
    className?: string;
}

export const VideoPlayer = (props: VideoPlayerProps) => {
    const videoNode = useRef<HTMLVideoElement | null>(null);
    const player = useRef<Player | null>(null);
    const { options, onReady, className } = props;

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!player.current) {
            if (!videoNode.current) return;

            player.current = videojs(videoNode.current, options, () => {
                onReady && onReady(player.current!);
            });
        } else {
            // Update player if options change
            const p = player.current;
            if (options.sources) {
                p.src(options.sources);
            }
            if (options.autoplay !== undefined) {
                p.autoplay(options.autoplay);
            }
        }
    }, [options, onReady]);

    // Dispose the player when the component unmounts
    useEffect(() => {
        const playerCurrent = player.current;

        return () => {
            if (playerCurrent && !playerCurrent.isDisposed()) {
                playerCurrent.dispose();
                player.current = null;
            }
        };
    }, []);

    return (
        <div data-vjs-player>
            <video ref={videoNode} className={`video-js vjs-big-play-centered ${className || ""}`} />
        </div>
    );
};

export default VideoPlayer;
