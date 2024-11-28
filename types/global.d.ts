// types/global.d.ts

// Speech Recognition API types
interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  
  // Meeting types
  interface Meeting {
    id: string;
    title?: string;
    createdTime: string;
    lastModified?: string;
    informe?: string;
  }
  
  // Chat message types
  interface ChatMessage {
    type: "user" | "bot" | "reference" | "web";
    content: string;
  }
  
  // Web search result types
  interface WebSearchResult {
    title: string;
    url: string;
    description: string;
  }
  
  // Reference types
  interface MeetingReference {
    id: string;
    createdTime: string;
    title?: string;
  }
  
  // API response types
  interface ApiResponse {
    response: string;
    references?: MeetingReference[];
    webResults?: WebSearchResult[];
    error?: string;
  }