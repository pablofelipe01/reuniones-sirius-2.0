// /app/api/send-query/route.ts

import { NextApiRequest, NextApiResponse } from "next";

async function searchWeb(query: string) {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
  const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': BRAVE_API_KEY!
    }
  });

  if (!response.ok) {
    throw new Error('Web search failed');
  }

  const data = await response.json();
  // Return only the most relevant results
  return data.web?.results?.slice(0, 3) || [];
}

export async function POST(req: Request, res: Response) {
  try {
    const { query, meetingId, mode, includeWebSearch } = await req.json();

    if (!query || (mode === "single" && !meetingId)) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400 }
      );
    }

    let contextData;
    let references = [];
    let webResults = [];

    // Fetch web search results if requested
    if (includeWebSearch) {
      try {
        webResults = await searchWeb(query);
      } catch (error) {
        console.error("Web search error:", error);
        // Continue without web results if search fails
      }
    }

    if (mode === "global") {
      // Fetch all meetings for global search
      const allMeetingsResponse = await fetch(
        "https://sirius-reunion-default-rtdb.firebaseio.com/meetings.json"
      );
      const allMeetingsData = await allMeetingsResponse.json();

      const meetings = Object.entries(allMeetingsData).map(([id, data]: [string, any]) => ({
        id,
        ...data,
      }));

      contextData = meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title || 'Sin título',
        date: meeting.createdTime,
        content: meeting.informe || ''
      }));

    } else {
      const meetingResponse = await fetch(
        `https://sirius-reunion-default-rtdb.firebaseio.com/meetings/${meetingId}.json`
      );
      const meetingData = await meetingResponse.json();

      if (!meetingData) {
        return new Response(JSON.stringify({ error: "Meeting not found" }), {
          status: 404,
        });
      }

      contextData = [{
        id: meetingId,
        title: meetingData.title || 'Sin título',
        date: meetingData.createdTime,
        content: meetingData.informe || ''
      }];
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Enhanced system prompt with web search results
    const webSearchContext = webResults.length > 0
      ? `\n\nRelevant web search results:\n${webResults.map((result: any, index: number) => 
          `${index + 1}. ${result.title}\nURL: ${result.url}\nDescription: ${result.description}\n`
        ).join('\n')}`
      : '';

    const systemPrompt = mode === "global"
      ? `Eres un asistente útil que tiene acceso a todas las reuniones de la empresa y puede buscar información en internet. 
         Busca en todas las reuniones para encontrar la información más relevante.
         Si encuentras referencias específicas, menciónalas en tu respuesta.
         
         Reuniones disponibles para búsqueda:
         ${JSON.stringify(contextData)}
         
         ${webSearchContext}`
      : `Eres un asistente útil para discusiones de reuniones que también puede buscar información en internet. 
         Esta reunión es "${contextData[0].title}", creada el ${contextData[0].date}.
         Contexto de la reunión: ${contextData[0].content}
         
         ${webSearchContext}`;

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
            content: systemPrompt,
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
    
    if (mode === "global") {
      references = contextData.filter(meeting => 
        data.choices[0].message.content.toLowerCase().includes(meeting.id.toLowerCase()) ||
        (meeting.title && data.choices[0].message.content.toLowerCase().includes(meeting.title.toLowerCase()))
      );
    }

    return new Response(
      JSON.stringify({ 
        response: data.choices[0].message.content,
        references: references,
        webResults: webResults
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-query API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}