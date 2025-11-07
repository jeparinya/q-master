"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";

let socket: Socket | null = null;

const sound = [
  "/sound/4-ศูนย์.wav", "/sound/5-1.wav", "/sound/6-2.wav",
  "/sound/7-3.wav", "/sound/8-4.wav", "/sound/9-5.wav",
  "/sound/10-6.wav", "/sound/11-7.wav", "/sound/12-8.wav",
  "/sound/13-9.wav", "/sound/14-สิบ.wav", "/sound/15-สิบเอ็ด.wav",
  "/sound/78-สิบสอง.wav",
];
const officer = ["/sound/0-ขอเชิญหมาย.wav", "/sound/ที่ช่องบริ.wav", "/sound/17-ค่ะ.wav"];
const station_sound = [
  "/sound/29-จุดออกคิว.wav",
  "/sound/ที่ช่องจ่า.wav",
  "/sound/ที่การเงิน.wav",
  "/sound/ที่ช่องบริ.wav",
  "/sound/68-จุดซักประว.wav",
  "/sound/ที่ห้องตรวจ.mp3",
  "/sound/26-เคาน์เตอร์.wav",
  "/sound/27-ช่องจ่ายยา.wav",
  "/sound/29-จุดออกคิว.wav",
];

interface QueueData {
  id: number;
  queue_no: string;
  service_point: number;
  status: string;
  point: string;
  pointName: string;
  name: string;
  hn: string;
  vn: string;
  vstdate: string;
  department: string;
}

export default function DisplayPage() {
  const [currentQueue, setCurrentQueue] = useState<QueueData | null>(null);
  const [recentQueues, setRecentQueues] = useState<QueueData[]>([]);
  const searchParams = useSearchParams();
  const station = parseInt(searchParams.get("station") ?? "0");

  const isPlaying = useRef(false);
  const lastQueueRef = useRef<QueueData | null>(null);
  const soundQueue = useRef<QueueData[]>([]); // ✅ เพิ่ม queue สำหรับเสียง

  // 🔊 เล่นเสียงเรียงลำดับ
  function playAudioSequentially(files: string[], onFinish?: () => void) {
    if (files.length === 0) {
      onFinish?.();
      return;
    }
    const [first, ...rest] = files;
    const audio = new Audio(first);
    audio.play();
    audio.onended = () => playAudioSequentially(rest, onFinish);
  }

  // ✅ ระบบจัดการ queue ของเสียง
  function processQueue() {
    if (isPlaying.current || soundQueue.current.length === 0) return;

    const nextQueue = soundQueue.current.shift()!; // ดึงคิวแรกออก
    console.log(nextQueue);
    isPlaying.current = true;
    setCurrentQueue(nextQueue);
    lastQueueRef.current = nextQueue;
    console.log(nextQueue);
    playQueueSound(nextQueue, () => {
      isPlaying.current = false;
      processQueue(); // 🔁 เล่นคิวถัดไป
    });
  }

  // ✅ เมื่อมีคิวใหม่เข้ามา
  const handleNewQueue = (queue: QueueData) => {
    console.log("➡️ เรียกคิวใหม่:", queue.queue_no);

    const prevQueue = lastQueueRef.current;
    if (prevQueue && prevQueue.id !== queue.id) {
      setRecentQueues((prev) => [prevQueue, ...prev].slice(0, 5));
    }

    // ✅ เพิ่มเข้า soundQueue แล้วเรียก processQueue()
    soundQueue.current.push(queue);
    processQueue();
  };

  // ✅ ฟังก์ชันเล่นเสียงเรียกคิว
  const playQueueSound = (queue: QueueData, onFinish: () => void) => {
    const nums = (queue.queue_no || "").split("");
    const qSounds = nums.map((n) => sound[parseInt(n)]);
    const files = [
      officer[0],
      ...qSounds,
      station_sound[station],
      sound[parseInt(queue.point) || 0],
      officer[2],
    ];

    playAudioSequentially(files, () => {
      fetch("/api/queue/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queueId: queue.id,
          action: "recall",
        }),
      });
      onFinish?.();
    });
  };

  // ✅ เชื่อมต่อ socket
  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://172.17.17.29:3002");
    }

    socket.on("connect", () => {
      console.log("✅ Display connected:", socket?.id);
    });

    socket.on("queue-called", (queue: QueueData) => {
      // if (queue.service_point === station) handleNewQueue(queue);
    });

    socket.on("queue-called-display", (queue: QueueData) => {
      if (queue.service_point === station) handleNewQueue(queue);
    });

    return () => {
      socket?.off("queue-called");
      socket?.off("queue-called-display");
    };
  }, [station]);

  return (
    <div style={{ height: "100vh", background: "#1e90ff", color: "#fff", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around", fontFamily: "Prompt, sans-serif", padding: "2rem" }}>
      <div style={{ textAlign: "center", flex: 2 }}>
        {currentQueue ? (
          <>
            <h2 style={{ fontSize: "12rem", margin: 0 }}>{currentQueue.queue_no}</h2>
            <p style={{ fontSize: "3rem", margin: 0 }}>
              ช่องบริการ: <span>{currentQueue.point}</span>
            </p>
          </>
        ) : (
          <h2 style={{ fontSize: "6rem" }}>⏳ รอเรียก...</h2>
        )}
        <h1 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
          {station === 1 ? <>ระบบแสดงคิวห้องยา</> : <>ระบบแสดงคิวการเงินผู้ป่วยนอก</>}
        </h1>
      </div>

      <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", padding: "1.5rem", borderRadius: "20px", height: "85vh", overflowY: "auto" }}>
        <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "1rem" }}>🕘 คิวก่อนหน้า</h2>
        {recentQueues.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recentQueues.map((q, idx) => (
              <li key={`${q.id}-${idx}`} style={{ background: idx === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", marginBottom: "0.8rem", padding: "1rem", borderRadius: "10px", fontSize: "2rem", textAlign: "center" }}>
                {q.queue_no} <span style={{ fontSize: "1.5rem" }}>ช่อง {q.point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center", fontSize: "1.5rem", opacity: 0.8 }}>ยังไม่มีคิวก่อนหน้า</p>
        )}
      </div>
    </div>
  );
}
