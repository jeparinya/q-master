import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { io } from "socket.io-client";
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://172.17.17.29:3002");
const prisma = new PrismaClient();
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: Request) {
  try {
    const { queueId, action } = await req.json();
    // action: "served", "skip", "recall" เป็นต้น
    console.log({ queueId, action });
    const data: any = {};
    if (action === "served") {
      data.status = "served";
      data.servedAt = new Date();
    } else if (action === "skip") {
      data.status = "skipped";
    } else if (action === "recall") {
      data.status = "calling";
      data.calledAt = new Date();
    } else {
      return NextResponse.json({ success: false, error: "unknown action" }, { headers: headers });
    }

    const q = await prisma.queue.update({
      where: { id: queueId },
      data,
    });
    socket.emit("queueUpdate", { queueId, action, data });
    // TODO notify socket

    return NextResponse.json({ success: true, data: q }, { headers: headers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "server error" }, { headers: headers });
  }
}

