import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import User from "@/models/User";
import Interaction from "@/models/Interaction";
import Session from "@/models/Session";

export async function GET() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await connectToDatabase();

        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));

        const totalUsers = await User.countDocuments();
        const usersActiveToday = await User.countDocuments({ lastActive: { $gte: startOfToday } });
        const usersActiveThisWeek = await User.countDocuments({ lastActive: { $gte: startOfWeek } });

        const userStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalLogins: { $sum: "$loginCount" },
                    totalInteractions: { $sum: "$totalInteractions" },
                    totalTimeSpent: { $sum: "$totalTimeSpent" }
                }
            }
        ]);

        const avgSessionDuration = await Session.aggregate([
            { $group: { _id: null, avg: { $avg: "$duration" } } }
        ]);

        const mostActiveUser = await User.findOne().sort({ totalInteractions: -1 }).select("email totalInteractions");

        const onlineThreshold = new Date(Date.now() - 60000);
        const usersOnlineNow = await User.countDocuments({ lastActive: { $gt: onlineThreshold } });

        return NextResponse.json({
            totalUsers,
            usersActiveToday,
            usersActiveThisWeek,
            totalLogins: userStats[0]?.totalLogins || 0,
            totalInteractions: userStats[0]?.totalInteractions || 0,
            averageSessionDuration: avgSessionDuration[0]?.avg || 0,
            totalTimeSpent: userStats[0]?.totalTimeSpent || 0,
            mostActiveUser: mostActiveUser ? {
                email: mostActiveUser.email,
                interactions: mostActiveUser.totalInteractions
            } : null,
            usersOnlineNow
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
