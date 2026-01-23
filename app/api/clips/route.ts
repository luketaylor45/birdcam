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

    const files = fs.readdirSync(dir)
        .filter(f => f.endsWith(".mp4"))
        .sort();

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

        } catch (e) {
            console.error("Failed to read motion file:", e);
        }
    }

    const clipsWithMotion: Clip[] = files.map((file, index) => {
        const timePart = file.replace(".mp4", "").replace(/-/g, ":");
        const startStr = `${date} ${timePart}`;
        const startTime = new Date(startStr).getTime();

        let endTime;
        if (index < files.length - 1) {
            const nextTimePart = files[index + 1].replace(".mp4", "").replace(/-/g, ":");
            const nextStartStr = `${date} ${nextTimePart}`;
            endTime = new Date(nextStartStr).getTime();
        } else {
            endTime = startTime + 10 * 60 * 1000;
        }

        if (isNaN(startTime)) {
            return { name: file, hasMotion: false };
        }

        const hasMotion = motionTimestamps.some(t => t >= startTime && t < endTime);

        return {
            name: file,
            hasMotion
        };
    });

    return Response.json(clipsWithMotion);
}
