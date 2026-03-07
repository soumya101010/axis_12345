export async function trackEvent(action: string, metadata: any = {}) {
    try {
        await fetch("/api/analytics/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, metadata }),
        });
    } catch (error) {
        console.error("Failed to track event:", error);
    }
}
