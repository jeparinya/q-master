"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://172.17.17.29:3002");
// const socket = io(socketURL);
// socket.on('request-print-queue', (data) => {
//   socket.emit('request-print', { queue: data.queue_no });
// });

export default  function KioskPage() {
  const [servicePoint, setServicePoint] = useState("1");
  const [call, setCall] = useState("");
  // const [point, setPoint] = useState("1");
  // const data = {servicePoint,point}
  // socket.on('request-print-queue', (data) => {

  //   socket.emit('request-print', { queue: data.queue_no });
  // });


  const [status, setStatus] = useState<{ wconunt: number; calling: any[] , waiting: any[]}>({
    wconunt: 0,
    calling: [],
    waiting: [],
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://172.17.17.29:3000/api/queue/status");
      const json = await res.json();
      if (json.success) setStatus(json.data);
    } catch (err) {
      console.error("fetchStatus error:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // ดึงข้อมูลทุก 3 วิ
    return () => clearInterval(interval);
  }, []);



  const handleNewQueue = async () => {
    // await getQueueData();
    socket.emit("new-queue", servicePoint);
  //  await getQueueData();
    // console.log(servicePoint);
    // socket.on('request-print-queue', (data) => {
    //   // console.log('📨 ได้รับคำสั่งพิมพ์:', data);
    //   // printQueue(data);
    //   socket.emit('request-print', { queue: data });
    // });
    // socket.emit('request-print', { queue: 'A001' });
    // socket.emit("print-ticket", servicePoint);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {

    const input = inputRef.current;
    if (!input) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // ถ้าไม่ได้คลิก select ให้ focus input
      if (target.id !== "location") {
        setTimeout(() => input.focus(), 0);
      }
    };

    // focus ตอนโหลดหน้า
    input.focus();

    // ตรวจสอบคลิกบนหน้า
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleCallQueue = (HN: string) => {
    // console.log({ queueNo,servicePoint, point })
    // socket.emit("call-queue", {queueNo, servicePoint, point });
    socket.emit("new-queue", { servicePoint, HN });
    setCall("");
  };
  // const queueData = await getQueueData();
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl mb-4">ออกคิวบริการ</h1>
      <select
        id="location"
        value={servicePoint}
        onChange={(e) => setServicePoint(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="1">จุดบริการ ห้องยา</option>
        <option value="2">จุดบริการ การเงิน</option>
      </select>

      <input
        ref={inputRef}
        type="text"
        placeholder="พิมพ์ที่นี่..."
        className="border border-gray-400 rounded-lg p-2 w-64 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={call}
        onChange={(e) => setCall(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const value = (e.target as HTMLInputElement).value;
            console.log("Enter pressed, value:", value);
            handleCallQueue(value);
            // socket.emit("new-queue", servicePoint);
          }
        }}
      />
          <h2 style={{ fontSize: "5rem", margin: 0 }}>
             กรุณาสแกน<br></br>คิวอาร์โค้ด (QR CODE)
             <br></br>ใบนำทางเพื่อ<br></br>รับคิวการเงิน
            </h2>
      {/* <button
        onClick={handleNewQueue}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        ออกบัตรคิว
      </button> */}
      <div className="p-4">
      <h2 className="text-xl font-bold mb-2">สถานะคิว</h2>
      <p>🕒 รอเรียก: {status.wconunt} คิว</p>

      <h3 className="mt-4 text-lg font-semibold">🔊 :</h3>
      <ul>
        {status.calling.map((c: any) => (
          <li key={c.id}>
            {c.queueNumber} - ช่องบริการ {c.counter?.name} ({c.servicePoint?.name})
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}
