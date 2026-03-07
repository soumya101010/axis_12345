import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { sessionId } = await req.json();
        await connectToDatabase();

        const dbSession = await Session.findById(sessionId);
        if (dbSession && !dbSession.endTime) {
            const endTime = new Date();
            const duration = Math.floor((endTime.getTime() - dbSession.startTime.getTime()) / 1000);

            dbSession.endTime = endTime;
            dbSession.duration = duration;
            await dbSession.save();

            await User.updateOne(
                { email: session.user.email },
                {
                    $inc: { totalTimeSpent: duration },
                    $set: { lastActive: endTime }
                }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
