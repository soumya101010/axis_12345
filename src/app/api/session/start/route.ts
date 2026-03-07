import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";

export async function POST() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectToDatabase();
        const newSession = await Session.create({
            email: session.user.email,
            startTime: new Date()
        });

        await User.updateOne(
            { email: session.user.email },
            { $set: { lastActive: new Date() } }
        );

        return NextResponse.json({ sessionId: newSession._id });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
