import { GoogleGenAI } from "@google/genai";
import { Application, Complaint } from "../types";

/**
 * Helper to check if AI features can be enabled.
 */
export const isAiConfigured = () => {
  return !!process.env.API_KEY;
};

/**
 * Generates an executive summary based on the current system state.
 */
export const generateExecutiveSummary = async (applications: Application[], complaints: Complaint[]) => {
  const dataContext = `
    Total PWD Applications: ${applications.length}
    Pending PWD Applications: ${applications.filter(a => a.status === 'Pending').length}
    Recent PWD Complaints/Inquiries: ${complaints.length}
    Sample Subjects: ${complaints.map(c => c.subject).join(', ')}
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following data context and provide a brief, 2-sentence executive summary highlighting key areas requiring attention for PWD management.
      
      Data Context:
      ${dataContext}
      `,
      config: {
        systemInstruction: "You are an AI assistant for a PWD (Persons with Disabilities) Management System administrator in San Juan City.",
      }
    });

    return response.text || "Summary analysis completed.";
  } catch (error) {
    console.error("Gemini Executive Summary Error:", error);
    return "The system encountered an error while analyzing recent PWD data.";
  }
};

/**
 * Analyzes a specific complaint to generate a short dashboard tag.
 */
export const analyzeComplaint = async (complaintDetails: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this PWD citizen complaint in 5 words or less for a quick status dashboard tag: "${complaintDetails}"`,
    });
    
    return response.text || "Complaint analyzed.";
  } catch (error) {
    console.error("Gemini Complaint Analysis Error:", error);
    return "Analysis failed";
  }
};