import { NextResponse } from "next/server";
import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: Request) {
  try {
    const { message, context = [], systemMessage = "" } = await request.json();

    const messages: Message[] = [];
    
    if (systemMessage) {
      messages.push({ role: "system", content: systemMessage });
    }

    messages.push(...context);

    messages.push({ role: "user", content: message });

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      message: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
