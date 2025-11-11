import captionService from '../captionService';

describe('CaptionService', () => {
  describe('extractHashtags', () => {
    it('should extract hashtags from a caption', () => {
      const caption = 'Beautiful sunset #nature #photography #sunset';
      const hashtags = captionService.extractHashtags(caption);
      
      expect(hashtags).toEqual(['nature', 'photography', 'sunset']);
    });

    it('should return empty array when no hashtags present', () => {
      const caption = 'This is a caption without any tags';
      const hashtags = captionService.extractHashtags(caption);
      
      expect(hashtags).toEqual([]);
    });

    it('should handle multiple word hashtags', () => {
      const caption = 'Check this out #InstagramClone #AIpowered #SocialMedia';
      const hashtags = captionService.extractHashtags(caption);
      
      expect(hashtags).toEqual(['InstagramClone', 'AIpowered', 'SocialMedia']);
    });

    it('should handle hashtags with numbers', () => {
      const caption = 'Testing #2024goals #AI4Good';
      const hashtags = captionService.extractHashtags(caption);
      
      expect(hashtags).toEqual(['2024goals', 'AI4Good']);
    });
  });

  describe('isAvailable', () => {
    it('should return a boolean indicating service availability', () => {
      const isAvailable = captionService.isAvailable();
      
      // Should be boolean
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('generateCaptionsFromBuffer', () => {
    it('should return error when service is not available and API key is missing', async () => {
      // This test assumes OPENAI_API_KEY is not set in test environment
      if (!captionService.isAvailable()) {
        const buffer = Buffer.from('fake image data');
        const result = await captionService.generateCaptionsFromBuffer(buffer, 'image/jpeg');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('not available');
      }
    });

    it('should handle invalid image buffer gracefully', async () => {
      if (captionService.isAvailable()) {
        const buffer = Buffer.from('invalid image');
        const result = await captionService.generateCaptionsFromBuffer(buffer, 'image/jpeg');
        
        // Should not throw error, should return error response
        expect(result.success).toBeDefined();
      }
    });
  });
});
