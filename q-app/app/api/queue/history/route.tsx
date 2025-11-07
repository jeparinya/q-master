import { NextRequest, NextResponse } from 'next/server';
import pool from "@/lib/db";
let cachedToken: string | null = null;
let tokenExpire: number | null = null;

export async function GET(req: NextRequest) {

    try {
        const hnParam = req.nextUrl.searchParams.get("hn");

        if (!hnParam) {
            return NextResponse.json({ success: false, message: "Missing cid parameter" }, { status: 400 });
        }
        const client = await pool.connect();
        const result = await client.query(`select 
    oqueue,o.hn,o.vn,o.vstdate,k.department,p.pname,p.fname,p.lname,r.status,bill_time,rx.confirm_substock_transaction as confirm_med , cast(rx.rx_dispenser_datetime as time) as timemed    
   from ovst o
   left join patient p on p.hn = o.hn
   left join kskdepartment k on k.depcode = o.main_dep 
   left join rcpt_print r on r.vn = o.vn
   left join rx_dispenser_detail rx on rx.vn = o.vn and rx_dispenser_type_id ='4'  
    where  (o.hn=$1 OR oqueue =$2) 
   ORDER BY o.vstdate DESC limit 1`, [hnParam.toString(), hnParam.toString()]);
        client.release();

        return NextResponse.json({ success: true, data: result.rows });
    } catch (err: any) {
        console.error("GET error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': ' GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

