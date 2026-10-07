import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('CRITICAL: GEMINI_API_KEY is missing from environment variables.');
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Prompt Generators ──────────────────────────────────────────────────────

export const generateAdaptationPrompt = ({
  studentName,
  reason,
  currentCapacity,
  newCapacity,
  lastStruggledTopic,
  completedCount,
  totalMissions,
}) => `
User Context:
- Student: ${studentName}
- Interruption/Reason: ${reason}
- Previous Daily Budget: ${currentCapacity} minutes
- New Daily Budget: ${newCapacity} minutes
- Last Struggled Topic: ${lastStruggledTopic || 'None'}
- Completed Missions: ${completedCount} / ${totalMissions}

Task:
Generate a compassionate, highly motivating adaptation explanation and a restructured daily strategy for the student.

Respond ONLY with a valid JSON object (no markdown, no prose outside JSON) matching this schema:
{
  "encouragement": "String (Warm, empathetic framing acknowledging their current constraint)",
  "strategySummary": "String (1-2 sentences explaining how their schedule adapts to their new time budget)",
  "revisedPacing": "String (e.g. '3 missions per week @ 15 mins/day')",
  "focusRecommendation": "String (Exact concept to focus on next)",
  "actionableSteps": ["Step 1", "Step 2", "Step 3"]
}
`;

export const generateTutorPrompt = ({ missionTitle, concept, userQuestion }) => `
Context:
The student is working on the DSA mission: "${missionTitle}".
Concept Summary: "${concept}".
Student Question: "${userQuestion}"

Task:
Provide a clear, simple, concise explanation (under 150 words) with a code illustration if applicable.

Respond ONLY with a valid JSON object (no markdown, no prose outside JSON) matching this schema:
{
  "explanation": "String (Clear intuition breakdown)",
  "codeSnippet": "String (Short code snippet or empty string)",
  "keyTakeaway": "String (1 sentence summary line)"
}
`;

// ─── Safe JSON Extractor ─────────────────────────────────────────────────────
export const extractJSON = (rawText) => {
  if (!rawText) throw new Error('Empty AI response');
  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to find first JSON object in response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse valid JSON from AI response');
  }
};
