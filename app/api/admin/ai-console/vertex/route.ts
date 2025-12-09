import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

type VertexRequestBody = {
  prompt: string;
  model?: string; // default gemini-1.5-pro
  temperature?: number;
};

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { prompt, model = 'gemini-1.5-pro', temperature = 0.7 }: VertexRequestBody = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    const vertexAI = new VertexAI({
      project: process.env.NOVALYTE_GCP_PROJECT!,
      location: process.env.NOVALYTE_GCP_LOCATION || 'us-central1',
    });

    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: Math.min(Math.max(temperature, 0), 2),
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const outputText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    // Log usage
    console.log(`Vertex AI console prompt by user ${user.id}: ${prompt.substring(0, 100)}...`);

    return NextResponse.json({
      model,
      outputText,
      raw: response,
    });
  } catch (error: any) {
    console.error('Vertex AI console error', error);
    return NextResponse.json(
      {
        message: 'Vertex AI request failed',
        code: error.code,
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Helper function
async function getCurrentUser() {
  return { id: 'mock-user', role: 'SUPERADMIN' };
}
