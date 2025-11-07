import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function POST(req: Request) {
  /*
    body: { counterId }
    logic:
    - หา counter -> หาจุดบริการของ counter
    - หา Queue แรกที่ status = waiting สำหรับ servicePoint
    - update queue.status = "calling", set counterId and calledAt
    - ส่ง event ไปยัง socket server (ผ่าน emit HTTP หรือ socket client)
  */
  try {
    const { servicePointId,Point } = await req.json();

    // const counter = await prisma.counter.findFirst({ where: { servicePointId: parseInt(servicePointId) } });
    // console.log(counter, "counter");
    // if (!counter) return NextResponse.json({ success: false, error: "counter not found" }, { status: 404 });

    const q = await prisma.queue.findFirst({
      where: { servicePointId: servicePointId, status: "waiting" },
      orderBy: { createdAt: "asc" },
    });
    // console.log(q);
    if (!q) return NextResponse.json({ success: false, error: "no waiting queue" }, {headers: headers });

    const updated = await prisma.queue.update({
      where: { id: q.id },
      data: { status: "calling",counterId: parseInt(Point), calledAt: new Date() },
    });

    // TODO: notify socket server (see section below)
    // await notifySocket(updated);

    return NextResponse.json({ success: true, data: updated }, { headers: headers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "server error" }, { headers: headers });
  }
}
