import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import Interaction from "@/models/Interaction";

export async function GET() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await connectToDatabase();
        const interactions = await Interaction.find().sort({ timestamp: -1 }).limit(100);
        return NextResponse.json(interactions);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
