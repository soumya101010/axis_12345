import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await connectToDatabase();
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    await User.create({
                        googleId: account.providerAccountId,
                        email: user.email || "",
                        name: user.name || "",
                        avatarUrl: user.image || "",
                        loginCount: 1,
                        lastLogin: new Date(),
                    });
                } else {
                    await User.updateOne(
                        { email: user.email },
                        {
                            $inc: { loginCount: 1 },
                            $set: { lastLogin: new Date() }
                        }
                    );
                }
            }
            return true;
        },
        async jwt({ token, user, account, profile, trigger, session }) {
            // Handle manual session updates (from client update() call)
            if (trigger === "update" && session?.role) {
                token.role = session.role;
                console.log(`[AUTH JWT] Updated role to ${token.role} via trigger`);
            }

            // Force fetch MongoDB ID if it's missing or doesn't look like a valid ObjectID
            const isMongoId = token.id && typeof token.id === 'string' && /^[0-9a-fA-F]{24}$/.test(token.id);

            if (token.email && (!token.id || !isMongoId || !token.role)) {
                try {
                    await connectToDatabase();
                    const dbUser = await User.findOne({ email: token.email });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.role = dbUser.role || null;
                        console.log(`[AUTH JWT] Synced Mongo data for ${token.email}: ${token.id}, Role: ${token.role}`);
                    }
                } catch (err) {
                    console.error("[AUTH JWT] Failed to sync MongoDB data:", err);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Force the session user ID to be the MongoDB ObjectId
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
})
