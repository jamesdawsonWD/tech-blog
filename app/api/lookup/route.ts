// app/api/lookup/route.ts
import { NextResponse } from "next/server";
import { lookup } from "dns/promises";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

        // Strip protocol if present
        const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;

        const { address } = await lookup(hostname);

        return NextResponse.json({ ip: address });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Lookup failed" },
            { status: 500 }
        );
    }
}