// await prisma.servicePoint.create({ data: { name: "OPD", code: "OPD" } });
// await prisma.counter.create({ data: { name: "Counter 1", code: "C1", servicePointId: 1 } });

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    await prisma.servicePoint.create({ data: { name: "OPD", code: "OPD" } });
    // return NextResponse.json({
    //   success: true,
    //   queueNumber: savedQueue,
    // });
  } catch (error) {
    console.error("❌ Error adding queue:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกคิว" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
