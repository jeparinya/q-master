import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import { prisma } from "@/lib/prisma";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
// export async function GET() {
//   const waiting = await prisma.queue.count({ where: { status: "waiting" } });
//   const calling = await prisma.queue.findMany({
//     where: { status: "calling" },
//     include: { counter: true, servicePoint: true },
//   });
//   return NextResponse.json({ success: true, data: { waiting, calling } },{headers:headers});
// }

export async function GET() {
  try {
    // ดึงคิวทั้งหมดที่ยังรออยู่
    const waiting = await prisma.queue.findMany({
      where: { status: "waiting" },
      orderBy: { createdAt: "asc" },
      include: {
        servicePoint: true,
        counter: true,
      },
    });
    const wconunt = await prisma.queue.count({ where: { status: "waiting" } });
    // ดึงคิวที่กำลังถูกเรียก
    const calling = await prisma.queue.findMany({
      where: { status: "calling" },
      include: { counter: true, servicePoint: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        waiting,
        calling,
        wconunt,
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