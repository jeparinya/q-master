
import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
let cachedToken: string | null = null;
let tokenExpire: number | null = null;

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

export async function GET(req: NextRequest) {
    try {
      
      const hnParam = req.nextUrl.searchParams.get("hn");
      if (!hnParam) {
        return NextResponse.json(
          { success: false, message: "Missing hn parameter" },
          { status: 400, headers: headers }
        );
      }
  
      const client = await pool.connect();
      const query = `
        SELECT 
          oqueue, o.hn, o.vn, o.vstdate, k.department, p.pname, p.fname, p.lname,
          r.status, bill_time,
          rx.confirm_substock_transaction AS confirm_med,
          CAST(rx.rx_dispenser_datetime AS time) AS timemed
        FROM ovst o
        LEFT JOIN patient p ON p.hn = o.hn
        LEFT JOIN kskdepartment k ON k.depcode = o.main_dep 
        LEFT JOIN rcpt_print r ON r.vn = o.vn
        LEFT JOIN rx_dispenser_detail rx ON rx.vn = o.vn AND rx_dispenser_type_id = '4'
        WHERE (o.hn = $1 OR oqueue = $2)
          AND o.vstdate::date = NOW()::date
        ORDER BY o.vstdate DESC
        LIMIT 1
      `;
      const result = await client.query(query, [hnParam, hnParam]);
      client.release();
  
      return NextResponse.json({ success: true, data: result.rows }, { headers: headers });
    } catch (err: any) {
      console.error("GET error:", err);
      return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: headers });
    }
  }
  