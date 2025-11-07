import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function GET(req: NextRequest) {
 
  try {

    const servicePointId = req.nextUrl.searchParams.get("servicePointId");
    // console.log(servicePointId);
    if (!servicePointId) {
        return NextResponse.json({ success: false, message: "Missing servicePointId parameter" }, { status: 400 });
    }
    const counter = await prisma.counter.findMany({ where: { "servicePointId": parseInt(servicePointId) } });
    //  console.log(counter, "counter");
  
     
    return NextResponse.json({
        success: true,
        data: {
            counter,
        },
      },{headers:headers});


  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "server error" }, { headers: headers });
  }
}
