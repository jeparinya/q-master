import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  try {
    // ดึงคิวทั้งหมดที่ยังรออยู่
    const queueAll = await prisma.queue.findMany({
    //   where: { status: "waiting" },
      orderBy: { createdAt: "asc" },
      include: {
        servicePoint: true,
        counter: true,
      },
    });
    // const wconunt = await prisma.queue.count({ where: { status: "waiting" } });
    // // ดึงคิวที่กำลังถูกเรียก
    // const calling = await prisma.queue.findMany({
    //   where: { status: "calling" },
    //   include: { counter: true, servicePoint: true },
    // });

    return NextResponse.json({
      success: true,
      data: {
        queueAll,
      },
    },{headers:headers});
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "server error" }
      ,{headers:headers}
    );
  }
}