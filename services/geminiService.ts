import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, ModelId, ImageGenConfig } from "../types";

const SYSTEM_INSTRUCTION = `You are Yahya AI V2, a sophisticated, highly intelligent, and aesthetically minded AI assistant. 
Your interface is a sleek, dark-themed environment. You operate with absolute precision and accuracy. 
You are helpful, witty, and have a touch of dry humor when appropriate. 
If asked about your version, you are V2 - quicker, smarter, and better designed.`;

// Permissive safety settings to ensure the model responds to a wide range of questions
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getModelConfig(modelId: ModelId, imageGenConfig?: ImageGenConfig) {
    switch (modelId) {
      case 'flash':
        return {
          model: 'gemini-3-flash-preview',
          config: {
            temperature: 0.7,
            systemInstruction: SYSTEM_INSTRUCTION,
            safetySettings: SAFETY_SETTINGS,
          }
        };
      case 'pro':
        return {
          model: 'gemini-3-pro-preview',
          config: {
            temperature: 0.5, // Balanced for professional tasks
            systemInstruction: SYSTEM_INSTRUCTION,
            safetySettings: SAFETY_SETTINGS,
          }
        };
      case 'deep':
        return {
          model: 'gemini-3-pro-preview',
          config: {
            // Enable thinking for deep reasoning tasks
            thinkingConfig: { thinkingBudget: 2048 }, 
            systemInstruction: SYSTEM_INSTRUCTION + " You are in 'Deep' mode. Engage in extensive reasoning, step-by-step analysis, and thorough exploration of the user's query.",
            safetySettings: SAFETY_SETTINGS,
          }
        };
      case 'creative':
        return {
          model: 'gemini-3-pro-preview',
          config: {
            temperature: 1.0, // Higher temperature for creativity
            topP: 0.95,
            systemInstruction: SYSTEM_INSTRUCTION + " You are in 'Creative' mode. Be imaginative, expressive, and think outside the box.",
            safetySettings: SAFETY_SETTINGS,
          }
        };
      case 'imagine':
        return {
           model: 'gemini-3-pro-image-preview', // High quality image generation
           config: {
               imageConfig: {
                   aspectRatio: imageGenConfig?.aspectRatio || "1:1",
               }
               // Note: safetySettings might behave differently for image models, keeping defaults or minimal if needed, 
               // but text prompts for image gen usually follow similar rules.
           }
        };
      default:
        return {
          model: 'gemini-3-flash-preview',
          config: { 
            systemInstruction: SYSTEM_INSTRUCTION,
            safetySettings: SAFETY_SETTINGS,
          }
        };
    }
  }

  async *streamChat(
      history: Message[], 
      newMessage: string, 
      image: string | undefined, 
      modelId: ModelId,
      imageGenConfig?: ImageGenConfig
    ): AsyncGenerator<string, void, unknown> {
    
    const { model, config } = this.getModelConfig(modelId, imageGenConfig);

    // Special handling for Imagine model (Image Generation)
    if (modelId === 'imagine') {
        let prompt = newMessage;
        if (imageGenConfig?.style) {
            prompt += `\nStyle: ${imageGenConfig.style}`;
        }
        if (imageGenConfig?.negativePrompt) {
            prompt += `\nNegative Prompt: ${imageGenConfig.negativePrompt}`; // Often handled as part of prompt for this model
        }

        // Generate content (non-streaming for images usually)
        try {
            const response = await this.ai.models.generateContent({
                model: model,
                contents: {
                    parts: [{ text: prompt }]
                },
                config: config
            });

            // Extract image and text
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64Data = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || 'image/png';
                        yield `![Generated Image](data:${mimeType};base64,${base64Data})\n\n`;
                    } else if (part.text) {
                        yield part.text;
                    }
                }
            } else if (response.text) {
                // Fallback if only text is returned (e.g. refusal)
                yield response.text;
            }
        } catch (error) {
            console.error("Image Gen Error:", error);
            throw error;
        }
        return;
    }

    // Standard Chat Streaming (Text)
    const validHistory = history.filter(m => !m.isStreaming);
    
    const chatHistory: Content[] = validHistory.map(msg => ({
      role: msg.role,
      parts: [
        ...(msg.image ? [{
           inlineData: {
             mimeType: 'image/jpeg', 
             data: msg.image.split(',')[1]
           }
        } as Part] : []),
        { text: msg.content } as Part
      ]
    }));

    // Initialize chat with the specific model and config
    const chat = this.ai.chats.create({
      model: model,
      config: config,
      history: chatHistory
    });

    let messagePart: string | { text: string } | Part[] = newMessage;
    
    // If there is an image attached to the NEW message
    if (image) {
        const imagePart: Part = {
            inlineData: {
                mimeType: image.split(';')[0].split(':')[1] || 'image/jpeg',
                data: image.split(',')[1]
            }
        };
        const textPart: Part = { text: newMessage };
        messagePart = [imagePart, textPart];
    }

    try {
      const result = await chat.sendMessageStream({ message: messagePart });
      
      for await (const chunk of result) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();