import fs from "fs";
import path from "path";

const ARCHIVE_DIR = "/var/www/birdcam-api/archive";
const MOTION_FILE = "/var/www/birdcam-api/motion_history.txt";

interface Clip {
    name: string;
    hasMotion: boolean;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
        return Response.json({ error: "Missing date" }, { status: 400 });
    }

    const dir = path.join(ARCHIVE_DIR, date);
    if (!fs.existsSync(dir)) {
        return Response.json([]);
    }

    // 1. Get all video clips
    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith(".mp4"))
        .sort();

    // 2. Parse motion history
    let motionTimestamps: number[] = [];
    if (fs.existsSync(MOTION_FILE)) {
        try {
            const content = fs.readFileSync(MOTION_FILE, "utf-8");
            const lines = content.split("\n");
            // Format: Motion detected at: 2026-01-16 05:22:22
            const regex = /Motion detected at: (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;

            motionTimestamps = lines
                .map(line => {
                    const match = line.match(regex);
                    return match ? new Date(match[1]).getTime() : null;
                })
                .filter((t): t is number => t !== null && !isNaN(t));

            // Filter for the requested date (optimization) to reduce checks
            // We assume local time in logs matches the date folder structure
            // Or easier: Just keep them all as timestamps
        } catch (e) {
            console.error("Failed to read motion file:", e);
        }
    }

    // 3. Map clips to determine if they contain motion
    const clipsWithMotion: Clip[] = files.map((file, index) => {
        // Parse start time from filename "HH-MM-SS.mp4" + date
        // Note: Filename has no date, so we combine with `date` param
        const timePart = file.replace(".mp4", "").replace(/-/g, ":"); // HH:MM:SS
        const startStr = `${date} ${timePart}`;
        const startTime = new Date(startStr).getTime();

        // Determine end time
        // If there is a next clip, end time is next clip start
        // If last clip, assume a default duration (e.g., 10 minutes)
        let endTime;
        if (index < files.length - 1) {
            const nextTimePart = files[index + 1].replace(".mp4", "").replace(/-/g, ":");
            const nextStartStr = `${date} ${nextTimePart}`;
            endTime = new Date(nextStartStr).getTime();
        } else {
            endTime = startTime + 10 * 60 * 1000; // 10 minutes fallback
        }

        // Check format validity
        if (isNaN(startTime)) {
            return { name: file, hasMotion: false };
        }

        // Check if any motion event falls within [startTime, endTime)
        const hasMotion = motionTimestamps.some(t => t >= startTime && t < endTime);

        return {
            name: file,
            hasMotion
        };
    });

    return Response.json(clipsWithMotion);
}
