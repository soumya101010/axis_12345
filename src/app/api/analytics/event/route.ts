import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Interaction from "@/models/Interaction";
import User from "@/models/User";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { action, metadata } = await req.json();
        await connectToDatabase();

        await Interaction.create({
            email: session.user.email,
            action,
            metadata,
            timestamp: new Date()
        });

        await User.updateOne(
            { email: session.user.email },
            {
                $inc: { totalInteractions: 1 },
                $set: { lastActive: new Date() }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Interaction Tracking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
