import fs from "fs";
import path from "path";

const ARCHIVE_DIR = "/var/www/birdcam-api/archive";

export async function GET() {
    const dates = fs.existsSync(ARCHIVE_DIR)
        ? fs.readdirSync(ARCHIVE_DIR).filter(d =>
            fs.statSync(path.join(ARCHIVE_DIR, d)).isDirectory()
        )
        : [];

    return Response.json(dates.sort().reverse());
}
