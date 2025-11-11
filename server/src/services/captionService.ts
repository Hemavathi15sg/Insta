import OpenAI from 'openai';

interface CaptionResult {
  success: boolean;
  captions?: string[];
  error?: string;
}

class CaptionService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not found. AI caption generation will be disabled.');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      console.log('✅ OpenAI client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error);
    }
  }

  /**
   * Generate captions from an image buffer
   * @param imageBuffer - The image file buffer
   * @param mimeType - The MIME type of the image (e.g., 'image/jpeg')
   * @returns Promise with caption result
   */
  async generateCaptionsFromBuffer(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<CaptionResult> {
    if (!this.openai) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.',
      };
    }

    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      console.log(`🤖 Generating captions for image (${mimeType})...`);

      // Call OpenAI Vision API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Generate 3 creative and engaging Instagram captions for this image. Make them diverse in style: one short and catchy, one descriptive, and one with emojis. Return only the captions as a JSON array of strings, nothing else.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from OpenAI API');
      }

      // Parse the JSON response
      let captions: string[];
      try {
        captions = JSON.parse(content);
      } catch (parseError) {
        // Fallback: try to extract captions from non-JSON response
        console.warn('Response was not pure JSON, attempting to extract captions...');
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        captions = lines.slice(0, 3);
      }

      // Validate we have at least one caption
      if (!captions || captions.length === 0) {
        throw new Error('No captions generated from API response');
      }

      console.log(`✅ Successfully generated ${captions.length} caption(s)`);
      
      // Log event for analytics
      this.logCaptionEvent('success', captions.length);

      return {
        success: true,
        captions: captions.slice(0, 3), // Ensure max 3 captions
      };
    } catch (error) {
      console.error('❌ Error generating captions:', error);
      
      // Log event for analytics
      this.logCaptionEvent('error', 0);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate captions',
      };
    }
  }

  /**
   * Log caption generation events for analytics and debugging
   * @param status - Event status ('success' or 'error')
   * @param captionCount - Number of captions generated
   */
  private logCaptionEvent(status: 'success' | 'error', captionCount: number): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Caption Generation Event - Status: ${status}, Captions: ${captionCount}`;
    
    // Log to console (in production, this would go to a logging service)
    if (status === 'success') {
      console.log(`📊 ${logMessage}`);
    } else {
      console.error(`📊 ${logMessage}`);
    }
  }
}

// Export a singleton instance
export default new CaptionService();
