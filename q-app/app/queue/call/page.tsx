"use client";
import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface QueueData {
  id: number;
  queue_no: string;
  service_point: string;
  status: string;
  point: string;
  name: string;
  hn: string;
  vn: string;
  vstdate: string;
  department: string;
}

interface Counter {
  id: number;
  name: string;
}

export default function CallPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [servicePoint, setServicePoint] = useState("");
  const [point, setPoint] = useState("1");
  const [call, setCall] = useState("");
  const [currentQueue, setCurrentQueue] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(false);

  const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://172.17.17.29:3002";
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://172.17.17.29:3000";

  /** ✅ เชื่อมต่อ socket ครั้งเดียว */
  useEffect(() => {
    const s = io(socketURL, { reconnection: true, transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      console.log("🟢 Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      console.warn("🔴 Socket disconnected");
    });

    s.on("queue-updated", (data: QueueData[]) => {
      console.log("📦 Queue Updated:", data.length);
      setQueues(data);
    });

    s.on("queue-called", (data: QueueData) => {
      console.log("🎤 Queue Called:", data.queue_no);
      setCurrentQueue(data);
      setQueues((prev) =>
        prev.map((q) =>
          q.id === data.id ? { ...q, status: "calling" } : q
        )
      );
    });

    s.on("queue-error", (msg: { message: string }) => {
      alert("⚠️ " + msg.message);
    });

    return () => {
      s.disconnect();
      s.removeAllListeners();
    };
  }, [socketURL]);

  /** ✅ โหลด counter เมื่อเลือก service point */
  const changeCounter = useCallback(async (sp: string) => {
    setServicePoint(sp);
    if (!sp) return setCounters([]);
    try {
      const res = await fetch(`${apiURL}/api/queue/counters?servicePointId=${sp}`);
      const data = await res.json();
      setCounters(data?.data?.counter || []);
      console.log("📋 Loaded counters:", data?.data?.counter?.length);
    } catch (err) {
      console.error("❌ Error loading counters:", err);
    }
  }, [apiURL]);

  /** ✅ เรียกคิวถัดไป */
  const callNextQueue = useCallback(async () => {
    if (!socket || loading) return;
    if (!servicePoint || !point)
      return alert("⚠️ กรุณาเลือกจุดบริการและช่องบริการก่อน");

    setLoading(true);
    try {
      const res = await fetch(`${apiURL}/api/queue/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicePointId: parseInt(servicePoint),
          Point: parseInt(point),
        }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.error || "ไม่พบคิวรอเรียก");
      } else {
        console.log("✅ Next queue:", data.data.queueNumber);
        socket.emit("call-next", {
          servicePoint: parseInt(servicePoint),
          point,
          id: data.data.id,
        });
      }
    } catch (err) {
      console.error("❌ Error calling next queue:", err);
      alert("เกิดข้อผิดพลาดในการเรียกคิว");
    } finally {
      setLoading(false);
    }
  }, [socket, servicePoint, point, loading, apiURL]);

  /** ✅ เรียกซ้ำ */
  const handleCallAgainQueue = useCallback(
    (queueNo: string, id: number) => {
      if (!socket) return;
      console.log("🔁 Recall queue:", queueNo);
      socket.emit("call-queue-again", { queueNo, servicePoint, point, id });
    },
    [socket, servicePoint, point]
  );

  /** ✅ แสดงรายการคิว */
  // const renderQueueList = useCallback(
  //   (title: string, list: QueueData[], filter: (q: QueueData) => boolean,order: "asc" | "desc" = "asc" ) => (
  //     <ul className="border p-3 text-left w-full">
  //       <li className="flex justify-between items-center mb-2 font-bold">
  //         {title} ({list.filter(filter).length})
  //       </li>
  //       {list.filter(filter).map((q) => (
  //         <li key={q.id} className="flex justify-between items-center mb-2">
  //           <span>
  //             {q.queue_no} — {q.name ?? "-"} ({q.status})
  //           </span>
  //           <button
  //             onClick={() =>
  //               handleCallAgainQueue(String(q.queue_no).padStart(3, "0"), q.id)
  //             }
  //             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  //           >
  //             เรียกคิว
  //           </button>
  //         </li>
  //       ))}
  //     </ul>
  //   ),
  //   [handleCallAgainQueue]
  // );
  const renderQueueList = useCallback(
    (
      title: string,
      list: QueueData[],
      filter: (q: QueueData) => boolean,
      order: "asc" | "desc" = "asc" // ✅ เพิ่มพารามิเตอร์ order
    ) => {
      const sortedList = list
        .filter(filter)
        .sort((a, b) =>
          order === "asc"
            ? parseInt(a.queue_no) - parseInt(b.queue_no)
            : parseInt(b.queue_no) - parseInt(a.queue_no)
        );
  
      return (
        <ul className="border p-3 text-left w-full">
          <li className="flex justify-between items-center mb-2 font-bold">
            {title} ({sortedList.length})
          </li>
          {sortedList.map((q) => (
            <li key={q.id} className="flex justify-between items-center mb-2">
              <span>
                {q.queue_no} — {q.name ?? "-"} ({q.status})
              </span>
              <button
                onClick={() =>
                  handleCallAgainQueue(String(q.queue_no).padStart(3, "0"), q.id)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                เรียกคิว
              </button>
            </li>
          ))}
        </ul>
      );
    },
    [handleCallAgainQueue]
  );
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl mb-4">📣 เรียกคิว - จุดบริการ {servicePoint}</h1>

      {/* ✅ ตัวเลือกจุดบริการและช่อง */}
      <div className="space-y-4 mb-6">
        <select
          value={servicePoint}
          onChange={(e) => changeCounter(e.target.value)}
          className="border p-2 block mx-auto"
        >
          <option value="">เลือกจุดบริการ</option>
          <option value="1">จุดบริการ ห้องยา</option>
          <option value="2">จุดบริการ การเงิน</option>
        </select>

        <select
          value={point}
          onChange={(e) => setPoint(e.target.value)}
          className="border p-2 block mx-auto"
        >
          <option value="">เลือกช่องบริการ</option>
          {counters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="border p-2 block mx-auto"
          type="text"
          placeholder="พิมพ์หมายเลขคิว แล้วกด Enter"
          value={call}
          onChange={(e) => setCall(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && call.trim()) {
              handleCallAgainQueue(call.trim(), parseInt(call));
              setCall("");
            }
          }}
        />
      </div>

      <button
        onClick={callNextQueue}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "กำลังโหลด..." : "เรียกคิวถัดไป"}
      </button>

      {currentQueue && (
        <div className="mt-4 text-xl">
          🎤 <strong>เรียกคิว:</strong> {currentQueue.queue_no}
          <span className="text-gray-400"> (ช่อง {point})</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {renderQueueList(
          "รอเรียกคิว",
          queues,
          (q) =>
            parseInt(q.service_point) === parseInt(servicePoint) &&
            q.status === "waiting",
            "asc" 
        )}
        {renderQueueList(
          "คิวที่เรียกแล้ว",
          queues,
          (q) =>
            parseInt(q.service_point) === parseInt(servicePoint) &&
            q.status === "calling",
           "desc"
        )}
      </div>
    </div>
  );
}
