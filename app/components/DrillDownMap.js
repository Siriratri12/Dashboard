"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function DrillDownMap() {
  const [level, setLevel] = useState("country");
  const [mapInstance, setMapInstance] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [currentProvince, setCurrentProvince] = useState(null);
  const [currentDistrict, setCurrentDistrict] = useState(null);
  const LRef = useRef(null);

  const createTooltipContent = (name, count) => `
    <div style="text-align: center; font-family: 'Sarabun', Arial, sans-serif; padding: 3px 8px;">
      <strong style="font-size: 1.1em; color: #2c3e50;">${name}</strong><br>
      <span style="font-size: 0.95em; color: #34495e;">จำนวน: ${
        count !== undefined ? count.toLocaleString() : "N/A"
      }</span>
    </div>
  `;

  useEffect(() => {
    fetch("/api/alumni/count-alumni-location")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API call failed: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        setApiData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    if (!apiData) return;

    import("leaflet").then((LModule) => {
      LRef.current = LModule;
      const L = LRef.current;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const mapContainer = L.DomUtil.get("map");
      if (mapContainer && mapContainer._leaflet_id) {
        const oldMap = mapInstance;
        if (oldMap) {
          oldMap.remove();
        }
      }

      if (mapContainer && !mapContainer._leaflet_id) {
        const _map = L.map("map", {
          zoomControl: false, 
        }).setView(apiData.center || [13.736717, 100.523186], 6);

        L.control.zoom({ position: "bottomright" }).addTo(_map);

        setMapInstance(_map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        }).addTo(_map);

        const resetControl = L.control({ position: "topright" });
        resetControl.onAdd = function () {
          const div = L.DomUtil.create(
            "div",
            "leaflet-bar leaflet-control leaflet-control-custom"
          );
          
          div.style.backgroundColor = "white";
          div.style.padding = "8px 12px";
          div.style.cursor = "pointer";
          div.style.fontSize = "14px";
          div.style.fontFamily = "'Sarabun', Arial, sans-serif";
          div.style.fontWeight = "600";
          div.style.border = "1px solid #bdc3c7";
          div.style.borderRadius = "4px";
          div.style.color = "#2c3e50";
          div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)";
          div.title = "รีเซ็ตการแสดงผลแผนที่";
          div.innerHTML = "รีเซ็ตแผนที่";
          div.onmouseover = function () {
            this.style.backgroundColor = "#f9f9f9";
          };
          div.onmouseout = function () {
            this.style.backgroundColor = "white";
          };
          div.onclick = (e) => {
            L.DomEvent.stopPropagation(e);
            if (apiData) {
              loadCountries(_map, apiData);
            }
          };
          return div;
        };
        resetControl.addTo(_map);

        loadCountries(_map, apiData);
      } else if (mapInstance && apiData) {
        loadCountries(mapInstance, apiData);
      }
    });

    return () => {

    };
  }, [apiData]);

  function clearMarkers(map) {
    if (!map || !LRef.current) return;
    map.eachLayer((layer) => {
      if (layer instanceof LRef.current.Marker) {
        map.removeLayer(layer);
      }
    });
  }

  function loadCountries(map, countryData) {
    if (!map || !LRef.current) return;
    const L = LRef.current;
    setLevel("country");
    clearMarkers(map);
    setCurrentCountry(countryData);
    setCurrentProvince(null);
    setCurrentDistrict(null);

    map.setView(countryData.center || [13.736717, 100.523186], 6);

    if (countryData.center) {
      L.marker(countryData.center)
        .addTo(map)
        .bindTooltip(
          createTooltipContent(countryData.name, countryData.count),
          {
            direction: "top",
            permanent: false,
            sticky: true,
            offset: L.point(0, -10),
            className: "custom-tooltip",
          }
        )
        .on("click", () => loadProvinces(map, countryData));
    }
  }

  function loadProvinces(map, countryData) {
    if (!map || !LRef.current) return;
    const L = LRef.current;
    setLevel("province");
    clearMarkers(map);
    setCurrentCountry(countryData);
    setCurrentProvince(null);
    setCurrentDistrict(null);

    const provinces = countryData.children;

    provinces.forEach((province) => {
      if (province.center) {
        L.marker(province.center)
          .addTo(map)
          .bindTooltip(createTooltipContent(province.name, province.count), {
            direction: "top",
            permanent: false,
            sticky: true,
            offset: L.point(0, -10),
            className: "custom-tooltip",
          })
          .on("click", () => loadDistricts(map, province));
      }
    });

    if (provinces.length > 0) {
      const firstProvinceWithCenter = provinces.find((p) => p.center);
      if (firstProvinceWithCenter) {
        map.setView(firstProvinceWithCenter.center, 7);
      } else if (countryData.center) {
        map.setView(countryData.center, 6);
      }
    } else if (countryData.center) {
      map.setView(countryData.center, 6);
    }
  }

  function loadDistricts(map, provinceData) {
    if (!map || !LRef.current) return;
    const L = LRef.current;
    setLevel("district");
    clearMarkers(map);
    setCurrentProvince(provinceData);
    setCurrentDistrict(null);

    const districts = provinceData.children;

    districts.forEach((district) => {
      if (district.center) {
        L.marker(district.center)
          .addTo(map)
          .bindTooltip(createTooltipContent(district.name, district.count), {
            direction: "top",
            permanent: false,
            sticky: true,
            offset: L.point(0, -10),
            className: "custom-tooltip",
          })
          .on("click", () => loadSubdistricts(map, district));
      }
    });

    if (districts.length > 0) {
      const firstDistrictWithCenter = districts.find((d) => d.center);
      if (firstDistrictWithCenter) {
        map.setView(firstDistrictWithCenter.center, 9);
      } else if (provinceData.center) {
        map.setView(provinceData.center, 8);
      }
    } else if (provinceData.center) {
      map.setView(provinceData.center, 8);
    }
  }

  function loadSubdistricts(map, districtData) {
    if (!map || !LRef.current) return;
    const L = LRef.current;
    setLevel("subdistrict");
    clearMarkers(map);
    setCurrentDistrict(districtData);

    const tambons = districtData.children;

    tambons.forEach((tambon) => {
      if (
        typeof tambon.latitude === "number" &&
        typeof tambon.longitude === "number"
      ) {
        L.marker([tambon.latitude, tambon.longitude])
          .addTo(map)
          .bindTooltip(createTooltipContent(tambon.name, tambon.count), {
            direction: "top",
            permanent: false,
            sticky: true,
            offset: L.point(0, -10),
            className: "custom-tooltip",
          });
      }
    });

    if (tambons.length > 0) {
      const firstTambonWithCoords = tambons.find(
        (t) => typeof t.latitude === "number" && typeof t.longitude === "number"
      );
      if (firstTambonWithCoords) {
        map.setView(
          [firstTambonWithCoords.latitude, firstTambonWithCoords.longitude],
          12
        );
      } else if (districtData.center) {
        map.setView(districtData.center, 11);
      }
    } else if (districtData.center) {
      map.setView(districtData.center, 11);
    }
  }

  
  const backButtonStyle = {
    position: "absolute",
    top: "10px",
    left: "10px",
    zIndex: 1000,
    padding: "8px 12px",
    backgroundColor: "white",
    fontFamily: "'Sarabun', Arial, sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
    border: "1px solid #bdc3c7",
    borderRadius: "4px",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
  };

  const renderNavigation = () => {
    if (!mapInstance || !LRef.current || level === "country") return null;

    const goBack = (e) => {
      LRef.current.DomEvent.stopPropagation(e);
      if (level === "subdistrict" && currentProvince) {
        loadDistricts(mapInstance, currentProvince);
      } else if (level === "district" && currentCountry) {
        loadProvinces(mapInstance, currentCountry);
      } else if (level === "province" && apiData) {
        loadCountries(mapInstance, apiData);
      }
    };

    
    let currentBackButtonStyle = { ...backButtonStyle };

    return (
      <button
        onClick={goBack}
        style={currentBackButtonStyle}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
        title="ย้อนกลับไปยังระดับก่อนหน้า"
      >
        <span style={{ marginRight: "5px" }}>&larr;</span> {/* ลูกศรซ้าย */}
        ย้อนกลับ
      </button>
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        fontFamily: "'Sarabun', Arial, sans-serif",
      }}
    >
      {renderNavigation()}
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
