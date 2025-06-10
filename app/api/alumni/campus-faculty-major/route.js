// pages/api/alumni/campus-faculty-major.js (สำหรับ Pages Router)
// หรือ app/api/alumni/campus-faculty-major/route.js (สำหรับ App Router)

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api2.oas.psu.ac.th/api/count-alumni-major",
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store", // เพิ่มเพื่อป้องกันการ cache ข้อมูล ถ้าต้องการข้อมูลล่าสุดเสมอ
      }
    );

    // ตรวจสอบว่า response ไม่ OK และโยน Error ที่มีรายละเอียดมากขึ้น
    if (!response.ok) {
      const errorText = await response.text(); // พยายามอ่านข้อความ error จาก response
      console.error(
        `Upstream API error: Status ${response.status}, Details: ${errorText}`
      );
      throw new Error(
        `Failed to fetch data from external API: Status ${response.status}. Details: ${errorText.substring(0, 100)}...` // จำกัดความยาวของ error text
      );
    }

    const data = await response.json();

    // คืนข้อมูลตรง ๆ จาก API ภายนอก
    // ตรวจสอบว่า data มีโครงสร้างที่คาดหวังหรือไม่ (เช่น มี faculty_major_counts หรือไม่)
    if (!data || !Array.isArray(data.faculty_major_counts)) {
        console.warn("External API response does not contain expected 'faculty_major_counts' array.");
        // อาจจะส่ง error กลับไป หรือส่ง array ว่างเปล่า ขึ้นอยู่กับความต้องการ
        return NextResponse.json(
            { error: "Invalid data format from external API", faculty_major_counts: [] },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route error:", error);
    // ส่งข้อความ error ที่ละเอียดขึ้นกลับไปยัง client
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}`, faculty_major_counts: [] },
      { status: 500 }
    );
  }
}