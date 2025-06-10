// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const apiResponse = await fetch(
//       "https://api2.oas.psu.ac.th/api/count-alumni-location"
//     );
//     if (!apiResponse.ok) {
//       throw new Error(`API call failed: ${apiResponse.statusText}`);
//     }
//     const apiData = await apiResponse.json();

//     const processedData = {
//       name: "Thailand",
//       center: [13.736717, 100.523186], // Center of Thailand for the country level
//       children: [],
//     };

//     apiData.location_counts.forEach((provinceData) => {
//       const provinceChildren = [];
//       let provinceLatSum = 0;
//       let provinceLonSum = 0;
//       let provinceTambonCount = 0;

//       provinceData.districts.forEach((districtData) => {
//         const districtChildren = [];
//         let districtLatSum = 0;
//         let districtLonSum = 0;
//         let districtTambonCount = 0;

//         districtData.tambons.forEach((tambonData) => {
//           if (tambonData.latitude && tambonData.longitude) {
//             districtLatSum += tambonData.latitude;
//             districtLonSum += tambonData.longitude;
//             districtTambonCount++;

//             provinceLatSum += tambonData.latitude;
//             provinceLonSum += tambonData.longitude;
//             provinceTambonCount++;

//             districtChildren.push({
//               name: tambonData.tambon_name_th,
//               latitude: tambonData.latitude,
//               longitude: tambonData.longitude,
//               count: tambonData.count || 0,
//             });
//           }
//         });

//         const districtCenter =
//           districtTambonCount > 0
//             ? [
//                 districtLatSum / districtTambonCount,
//                 districtLonSum / districtTambonCount,
//               ]
//             : null; // Null if no valid tambons

//         provinceChildren.push({
//           name: districtData.district_name_th,
//           center: districtCenter,
//           children: districtChildren,
//         });
//       });

//       const provinceCenter =
//         provinceTambonCount > 0
//           ? [
//               provinceLatSum / provinceTambonCount,
//               provinceLonSum / provinceTambonCount,
//             ]
//           : null; // Null if no valid tambons

//       processedData.children.push({
//         name: provinceData.province_name_th,
//         center: provinceCenter,
//         children: provinceChildren,
//       });
//     });

//     return NextResponse.json(processedData);
//   } catch (error) {
//     console.error("API route error:", error);
//     return NextResponse.json(
//       { error: "Failed to process location data" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiResponse = await fetch(
      "https://api2.oas.psu.ac.th/api/count-alumni-location"
    );
    if (!apiResponse.ok) {
      throw new Error(`API call failed: ${apiResponse.statusText}`);
    }
    const apiData = await apiResponse.json();

    const processedData = {
      name: "Thailand",
      center: [13.736717, 100.523186],
      children: [],
      count: 0, // << เพิ่ม: เริ่มต้นจำนวนรวมของประเทศ
    };

    let countryTotalCount = 0;

    if (apiData.location_counts && Array.isArray(apiData.location_counts)) {
      apiData.location_counts.forEach((provinceData) => {
        const provinceChildren = [];
        let provinceLatSum = 0;
        let provinceLonSum = 0;
        let provinceTambonValidCount = 0;
        let provinceTotalCount = 0; // << เพิ่ม: ผลรวมจำนวนของจังหวัด

        if (provinceData.districts && Array.isArray(provinceData.districts)) {
          provinceData.districts.forEach((districtData) => {
            const districtChildren = [];
            let districtLatSum = 0;
            let districtLonSum = 0;
            let districtTambonValidCount = 0;
            let districtTotalCount = 0; // << เพิ่ม: ผลรวมจำนวนของอำเภอ

            if (districtData.tambons && Array.isArray(districtData.tambons)) {
              districtData.tambons.forEach((tambonData) => {
                const currentTambonCount = Number(tambonData.count) || 0;
                if (
                  typeof tambonData.latitude === "number" &&
                  typeof tambonData.longitude === "number"
                ) {
                  districtLatSum += tambonData.latitude;
                  districtLonSum += tambonData.longitude;
                  districtTambonValidCount++;

                  provinceLatSum += tambonData.latitude;
                  provinceLonSum += tambonData.longitude;
                  provinceTambonValidCount++;

                  districtChildren.push({
                    name: tambonData.tambon_name_th,
                    latitude: tambonData.latitude,
                    longitude: tambonData.longitude,
                    count: currentTambonCount,
                  });
                }
                districtTotalCount += currentTambonCount; // << เพิ่ม: บวกจำนวนตำบลเข้าผลรวมอำเภอ
              });
            }

            const districtCenter =
              districtTambonValidCount > 0
                ? [
                    districtLatSum / districtTambonValidCount,
                    districtLonSum / districtTambonValidCount,
                  ]
                : null;

            provinceChildren.push({
              name: districtData.district_name_th,
              center: districtCenter,
              children: districtChildren,
              count: districtTotalCount, // << เพิ่ม: ใส่ผลรวมของอำเภอ
            });
            provinceTotalCount += districtTotalCount; // << เพิ่ม: บวกผลรวมอำเภอเข้าผลรวมจังหวัด
          });
        }

        const provinceCenter =
          provinceTambonValidCount > 0
            ? [
                provinceLatSum / provinceTambonValidCount,
                provinceLonSum / provinceTambonValidCount,
              ]
            : null;

        processedData.children.push({
          name: provinceData.province_name_th,
          center: provinceCenter,
          children: provinceChildren,
          count: provinceTotalCount, // << เพิ่ม: ใส่ผลรวมของจังหวัด
        });
        countryTotalCount += provinceTotalCount; // << เพิ่ม: บวกผลรวมจังหวัดเข้าผลรวมประเทศ
      });
    }
    processedData.count = countryTotalCount; // << เพิ่ม: ใส่ผลรวมของประเทศ

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to process location data" },
      { status: 500 }
    );
  }
}
