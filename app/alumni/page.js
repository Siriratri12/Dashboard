"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const MyChart = dynamic(() => import("../components/MyChart"), { ssr: false });
const MyChart2 = dynamic(() => import("../components/MyChart2"), {
  ssr: false,
});
const DrillDownMap = dynamic(() => import("../components/DrillDownMap"), {
  ssr: false,
});

export default function Page() {
  // ตั้งค่าเริ่มต้นให้เป็น 'faculty' เสมอ เนื่องจากเราจะลบตัวเลือก 'agency' ออก
  const [view, setView] = useState("faculty");

  return (
    <>
      <style jsx>{`
        /* Using 'jsx' for scoped CSS in Next.js */
        .page-container {
          max-width: 1200px; /* Increased max-width for better layout */
          margin: 3rem auto;
          padding: 0 1.5rem; /* Slightly more padding */
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #004aad;
        }

        .main-title {
          font-weight: 700;
          font-size: 2.8rem; /* Slightly larger title */
          text-align: center;
          margin-bottom: 2.5rem; /* More space below title */
          color: #004aad;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); /* Stronger text shadow */
        }

        .button-group {
          display: flex;
          justify-content: center;
          gap: 1.5rem; /* Increased gap between buttons */
          margin-bottom: 2.5rem; /* More space below buttons */
        }

        .action-button {
          padding: 0.75rem 1.8rem; /* Increased padding */
          font-size: 1.15rem; /* Slightly larger font */
          font-weight: 600;
          border: 2px solid #004aad;
          background-color: white;
          color: #004aad;
          border-radius: 10px; /* More rounded corners */
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
          box-shadow: 0 3px 8px rgba(0, 74, 173, 0.2); /* Stronger initial shadow */
          user-select: none;
          outline: none; /* Remove outline on focus */
        }

        .action-button:hover {
          background-color: #79b2ff;
          color: white;
          box-shadow: 0 6px 15px rgba(0, 74, 173, 0.5); /* Enhanced hover shadow */
          transform: translateY(-3px); /* More pronounced lift */
        }

        .action-button.active {
          background-color: #004aad;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 74, 173, 0.7); /* Even stronger active shadow */
          transform: translateY(-3px);
          border-color: #004aad; /* Ensure border color stays primary */
        }

        .content-area {
          display: grid; /* Use CSS Grid for main layout */
          grid-template-columns: 1fr; /* Single column layout by default */
          gap: 3rem; /* Spacing between chart and map sections */
        }

        .section-box {
          background-color: #ffffff; /* White background for all content boxes */
          border-radius: 15px; /* More rounded corners for sections */
          padding: 2.5rem; /* Increased padding inside sections */
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12); /* Softer, deeper shadow */
          min-height: 550px; /* Minimum height for visual consistency */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #333; /* Darker text for readability */
          font-size: 1.1rem;
          font-style: italic;
          box-sizing: border-box;
          border: 1px solid #e0e0e0; /* Subtle border */
        }

        /* Specific styling for the map section if needed, though 'section-box' covers most */
        .map-section {
          /* Add map-specific styles here if different from .section-box */
          min-height: 500px; /* Adjust as needed for the map */
        }

        /* Responsive adjustments for larger screens */
        @media (min-width: 992px) {
          .content-area {
            grid-template-columns: 1fr; /* Keep single column for now, but ready for expansion */
          }
        }
      `}</style>

      <h1 className="main-title">รายงานข้อมูลศิษย์เก่า</h1>
      <div className="page-container">
        {/* ลบปุ่ม "หน่วยงาน" ออก และเหลือเพียงปุ่ม "วิทยาเขต / คณะ / สาขา" */}
        <div className="button-group">
          <button
            className={
              view === "faculty" ? "action-button active" : "action-button"
            }
            onClick={() => setView("faculty")} // ปุ่มนี้ยังคงสามารถเปลี่ยนสถานะได้ แต่จะถูกกำหนดเป็น "faculty" เสมอ
            aria-pressed={view === "faculty"}
          >
            วิทยาเขต / คณะ / สาขา
          </button>
        </div>

        <div className="content-area">
          <div className="section-box">
            <MyChart />
          </div>

          <div className="section-box map-section">
            <DrillDownMap />
          </div>
        </div>
      </div>
    </>
  );
}
