// apps/web/app/api/queue/add/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function POST(req: Request) {
  try {
    const { servicePointId, prefix,hn,vn,vstdate,name,department } = await req.json();
    console.log(servicePointId, prefix);
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0) - 7 * 60 * 60 * 1000);
    const endOfDay = new Date(now.setHours(23, 59, 59, 999) - 7 * 60 * 60 * 1000);
    // หาคิวล่าสุดของ ServicePoint
    const last = await prisma.queue.findFirst({
      where: { servicePointId:parseInt(servicePointId),
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        }, },
      orderBy: { createdAt: "desc" },
    });
    // await  prisma.queue
    const nextNumber = (last?.queueNumber ?? 0) + 1;
    console.log({
      queueNumber: nextNumber,
      prefix: prefix ?? null,
      hn: hn ?? null,
      vn: vn ?? null,
      vstdate: vstdate ?? null,
      name: name ?? null,
      department: department ?? null,
      servicePointId,
    });
    const q = await prisma.queue.create({
      data: {
        queueNumber: nextNumber,
        prefix: prefix ?? null,
        hn: hn ?? null,
        vn: vn ?? null,
        vstdate: vstdate ?? null,
        name: name ?? null,
        department: department ?? null,
        servicePointId,
      },
    });
    
    return NextResponse.json({ success: true, data: q }, { headers: headers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "server error" }, { headers: headers });
  }
}
