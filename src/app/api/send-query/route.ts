import { NextApiRequest, NextApiResponse } from "next";

export async function POST(req: Request, res: Response) {
  try {
    const { query, meetingId } = await req.json();

    if (!query || !meetingId) {
      return new Response(
        JSON.stringify({ error: "Missing query or meetingId" }),
        { status: 400 }
      );
    }

    // Fetch the specific meeting details from Firebase
    const firebaseUrl = `https://sirius-reunion-default-rtdb.firebaseio.com/meetings/${meetingId}.json`;
    const meetingResponse = await fetch(firebaseUrl);
    const meetingData = await meetingResponse.json();

    if (!meetingData) {
      return new Response(JSON.stringify({ error: "Meeting not found" }), {
        status: 404,
      });
    }

    // Replace with your OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for meeting discussions. This meeting is titled "${meetingData.title || 'Untitled Meeting'}", created on ${meetingData.createdTime || 'Unknown date'}.\n\nHere is the meeting context: ${meetingData.informe || 'No additional context provided.'}`,
          },
          { role: "user", content: query },
        ],
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      throw new Error(`OpenAI API Error: ${openAiResponse.status}`);
    }

    const data = await openAiResponse.json();

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-query API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
