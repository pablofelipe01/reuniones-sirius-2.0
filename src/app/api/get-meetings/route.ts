// /app/api/get-meetings/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const firebaseUrl = "https://sirius-reunion-default-rtdb.firebaseio.com/meetings.json";

  try {
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error(`Error fetching data from Firebase: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
      return NextResponse.json({ meetings: [] }, { status: 200 });
    }

    // Transformar los datos en un array de reuniones
    const meetings = Object.entries(data).map(([key, value]: [string, any]) => ({
      id: key, // Usar siempre el key de Firebase como id para consistencia
      title: value.title || "",
      createdTime: value.createdTime || null,
      lastModified: value.lastModified || null,
      informe: value.informe || "",
    }));

    console.log(`Total meetings fetched: ${meetings.length}`);

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Failed to fetch meetings from Firebase" }, { status: 500 });
  }
}
