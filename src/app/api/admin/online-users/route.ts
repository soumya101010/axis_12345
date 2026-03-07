import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import User from "@/models/User";

export async function GET() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await connectToDatabase();
        const onlineThreshold = new Date(Date.now() - 60000);
        const onlineUsers = await User.find({ lastActive: { $gt: onlineThreshold } }).select("email name avatarUrl lastActive");
        return NextResponse.json(onlineUsers);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
