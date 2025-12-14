import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle Farcaster mini app events
    const { event } = body;

    switch (event) {
      case "miniapp_added":
        console.log("Mini app added by user");
        break;
      case "miniapp_removed":
        console.log("Mini app removed by user");
        break;
      case "notifications_enabled":
        console.log("Notifications enabled");
        break;
      case "notifications_disabled":
        console.log("Notifications disabled");
        break;
      default:
        console.log("Unknown event:", event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
