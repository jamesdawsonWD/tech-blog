import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] ?? "IP not available";

    return NextResponse.json({ ip });
}