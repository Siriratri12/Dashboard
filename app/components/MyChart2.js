"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function DepartmentTreemap() {
  const [treemapData, setTreemapData] = useState([]);
  const [selectedCampusForPopup, setSelectedCampusForPopup] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/alumni/department");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("API response is not an array:", data);
          setTreemapData([]);
          return;
        }

        const dataWithValue = data.map((campus) => ({
          name: campus.name,
          value: campus.children ? campus.children.length : 0,
          children: campus.children || [],
        })).filter(campus => campus.value > 0);

        setTreemapData(dataWithValue);
      } catch (error) {
        console.error("Error loading treemap data:", error);
        setTreemapData([]);
      }
    }

    fetchData();
  }, []);

  const option = {
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    title: {
      text: "รายงานหน่วยงานตามวิทยาเขต",
      left: "center",
      textStyle: { fontSize: 20, fontWeight: "bold", color: "#004AAD" },
    },
    tooltip: {
      formatter: (info) => {
        const name = info.name || 'ไม่ระบุ';
        const value = info.value || 0;
        return `${name} : ${value} หน่วยงาน`;
      },
    },
    color: ["#3399ff", "#004080", "#99ccff", "#002855", "#0066cc"],
    series: [
      {
        type: "treemap",
        data: treemapData,
        roam: false,
        label: {
          show: true,
          formatter: "{b}\n{c} หน่วยงาน",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 11,
        },
        upperLabel: {
          show: true,
          height: 30,
          color: "#fff",
        },
        breadcrumb: { show: false },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
          gapWidth: 1,
        },
        
        colorMappingBy: "index",
        animationDurationUpdate: 800,
        animationEasingUpdate: 'cubicOut',
      },
    ],
  };

  function onChartClick(params) {
    if (params.data && params.data.children && params.data.children.length > 0) {
      setSelectedCampusForPopup({
        name: params.data.name,
        departments: params.data.children.sort((a, b) => b.name.localeCompare(a.name)),
      });
    } else {
      setSelectedCampusForPopup(null);
    }
  }

  const handleClosePopup = () => {
    setSelectedCampusForPopup(null);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        maxWidth: 1300,
        width: "100%",
        margin: "auto",
      }}
    >
      <div
        className="p-4 bg-white rounded shadow"
        style={{ flex: 1, height: 600, position: "relative" }}
      >
        {treemapData.length > 0 ? (
          <ReactECharts
            option={option}
            style={{ width: "100%", height: "100%" }}
            onEvents={{ click: onChartClick }}
          />
        ) : (
          <div style={{ textAlign: "center", paddingTop: "50px",fontStyle: "normal", fontWeight: "bold",color: "#004AAD",fontSize: 40 }}>
            Loading...
          </div>
        )}
      </div>

      {selectedCampusForPopup && (
        <div
          style={{
            width: 250,
            height: 350,
            backgroundColor: "#f9f9f9",
            borderRadius: 8,
            padding: 15,
            overflowY: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            marginTop: "100px",
            position: "relative",
          }}
        >
          <button
            onClick={handleClosePopup}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              padding: "4px 8px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px",
            }}
          >
            X Close
          </button>

          <h3
            style={{
              marginTop: 0,
              marginBottom: 6,
              color: "#004AAD",
              borderBottom: "1px solid #ddd",
              paddingBottom: 6,
              fontSize: "1em",
              fontStyle: "normal",
              fontWeight: "bold",
            }}
          >
            {selectedCampusForPopup.name}
          </h3>
          <h4
            style={{
              marginTop: 15,
              marginBottom: 8,
              color: "#333",
              fontSize: "1em",
              fontStyle: "normal",
            }}
          >
            หน่วยงาน:
          </h4>
          {selectedCampusForPopup.departments.length > 0 ? (
            <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
              {selectedCampusForPopup.departments.map((dep, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      flexGrow: 1,
                      marginRight: 8,
                      fontSize: "0.85em",
                      fontStyle: "normal",
                    }}
                  >
                    {dep.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "0.8em", fontStyle: "normal" }}>
              ไม่พบข้อมูลหน่วยงานในวิทยาเขตนี้
            </p>
          )}
        </div>
      )}
    </div>
  );
}