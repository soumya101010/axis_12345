import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import FocusSession from "@/models/FocusSession";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await connectToDatabase();
        const sessions = await FocusSession.find({ userId: session.user.id }).sort({ date: -1 }).limit(20);
        return NextResponse.json(sessions);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sessions", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const email = session.user.email as string;
        const { label, durationMinutes } = await req.json();
        if (!durationMinutes) return NextResponse.json({ error: "Duration is required" }, { status: 400 });
        await connectToDatabase();
        const focusSession = await FocusSession.create({
            userId: session.user.id,
            label: label || "Deep Work",
            durationMinutes,
        });

        // Track interaction
        try {
            const Interaction = (await import("@/models/Interaction")).default;
            const User = (await import("@/models/User")).default;
            await Interaction.create({
                email: session.user.email as string,
                action: "focus_started",
                metadata: { sessionId: focusSession._id.toString(), label: focusSession.label, duration: durationMinutes }
            });
            await User.updateOne({ email: session.user.email as string }, { $inc: { totalInteractions: 1 } });
        } catch (e) {
            console.error("Tracking Error:", e);
        }

        return NextResponse.json(focusSession, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log session", details: String(error) }, { status: 500 });
    }
}
