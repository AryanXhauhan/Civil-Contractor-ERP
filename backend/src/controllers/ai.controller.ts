import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../index';
import * as fs from 'fs';

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const parseDailyReportWithAI = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { projectId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No image or PDF file provided' });
    }
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const mimeType = file.mimetype;
    // Base64 encode the file data
    const b64Data = fs.readFileSync(file.path, 'base64');

    const prompt = `
      You are an AI assistant for a construction ERP system.
      Extract information from the provided daily site report or material receipt and return it as JSON.
      Your output MUST be a valid JSON object with the following fields (all are optional strings except workforceCount which is a number):
      {
        "date": "YYYY-MM-DD",
        "weather": "string",
        "workforceCount": number,
        "workCompleted": "string summarizing work done",
        "materialsUsed": "string listing materials",
        "equipmentUsed": "string listing equipment",
        "problems": "string summarizing any issues",
        "safetyIncidents": "string describing safety incidents",
        "notes": "any extra notes"
      }
      Do not include markdown backticks around the JSON. Only output the raw JSON object.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: b64Data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    // Clean up the uploaded file
    fs.unlinkSync(file.path);

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI returned empty response");
    }

    const parsedData = JSON.parse(jsonText);

    res.json({
      message: 'Extracted successfully',
      extractedData: parsedData,
    });
  } catch (error) {
    console.error('Error in AI Extraction:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to extract data using AI' });
  }
};
