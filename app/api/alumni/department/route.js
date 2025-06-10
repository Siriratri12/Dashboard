
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET() {
  try {
    const promisePool = mysqlPool.promise();

    const [rows] = await promisePool.query(`
      SELECT
        campus_name_thai,
        department_name_thai
      FROM departments
    `);

    const grouped = {};

    rows.forEach(({ campus_name_thai, department_name_thai }) => {
      const campus = campus_name_thai?.trim();
      const department = department_name_thai?.trim();

      if (!campus || !department) return;

      if (!grouped[campus]) {
        grouped[campus] = {
          name: campus,
          children: [],
        };
      }

      grouped[campus].children.push({
        name: department,
      });
    });

    const treemapData = Object.values(grouped).map(campus => {
      campus.children.sort((a, b) => a.name.localeCompare(b.name));
      return campus;
    });

    return NextResponse.json(treemapData);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
