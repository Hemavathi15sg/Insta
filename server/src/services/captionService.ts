import OpenAI from 'openai';

/**
 * AI-powered caption generation service using OpenAI GPT-4 Vision
 * Generates descriptive captions with hashtags for Instagram posts
 */
class CaptionService {
  private openai: OpenAI | null = null;
  private readonly MAX_HASHTAGS = 5;
  private readonly MIN_HASHTAGS = 3;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
      console.warn('   Caption generation will not be available');
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
   * Check if the service is available (API key configured)
   */
  isAvailable(): boolean {
    return this.openai !== null;
  }

  /**
   * Generate captions from an image buffer
   * @param imageBuffer - The image file buffer
   * @param mimeType - The MIME type of the image (e.g., 'image/jpeg')
   * @returns Promise with caption suggestions or error
   */
  async generateCaptionsFromBuffer(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<{ success: boolean; captions?: string[]; error?: string }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Caption generation service is not available. Please configure OPENAI_API_KEY.',
      };
    }

    try {
      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      // Call OpenAI Vision API
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and generate 3 engaging Instagram captions. Each caption should:
1. Be descriptive and engaging (1-2 sentences)
2. Match the mood and content of the image
3. Include ${this.MIN_HASHTAGS}-${this.MAX_HASHTAGS} relevant hashtags at the end
4. Be suitable for social media posting

Format each caption on a new line, separated by "---"`,
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

      // Parse the response
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        return {
          success: false,
          error: 'No captions generated from the AI model',
        };
      }

      // Split the response into individual captions
      const captions = content
        .split('---')
        .map((caption) => caption.trim())
        .filter((caption) => caption.length > 0)
        .slice(0, 3); // Ensure we only return 3 captions

      if (captions.length === 0) {
        return {
          success: false,
          error: 'Failed to parse captions from AI response',
        };
      }

      return {
        success: true,
        captions: captions,
      };
    } catch (error: any) {
      console.error('Error generating captions:', error);
      
      // Handle specific OpenAI errors
      if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid OpenAI API key. Please check your configuration.',
        };
      } else if (error.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        };
      } else if (error.status === 413) {
        return {
          success: false,
          error: 'Image file is too large. Please use a smaller image.',
        };
      }

      return {
        success: false,
        error: error.message || 'An unexpected error occurred while generating captions',
      };
    }
  }

  /**
   * Extract hashtags from a caption
   * @param caption - The caption text
   * @returns Array of hashtags (without # symbol)
   */
  extractHashtags(caption: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = caption.match(hashtagRegex);
    
    if (!matches) {
      return [];
    }

    return matches.map(tag => tag.substring(1)); // Remove # symbol
  }
}

// Export a singleton instance
export default new CaptionService();
