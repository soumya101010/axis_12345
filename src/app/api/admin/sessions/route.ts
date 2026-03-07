import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import Session from "@/models/Session";

export async function GET() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await connectToDatabase();
        const sessions = await Session.find().sort({ startTime: -1 }).limit(100);
        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
