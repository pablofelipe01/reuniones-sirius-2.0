import { NextResponse } from "next/server";

export async function GET() {
  const firebaseUrl = "https://sirius-reunion-default-rtdb.firebaseio.com/meetings.json";

  try {
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error(`Error fetching data from Firebase: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform data into an array of meetings
    const meetings = Object.entries(data).map(([key, value]: [string, any]) => ({
      id: value.id || key,
      createdTime: value.createdTime || null,
      lastModified: value.lastModified || null,
      informe: value.informe || "",
    }));

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ error: "Failed to fetch meetings from Firebase" }, { status: 500 });
  }
}
