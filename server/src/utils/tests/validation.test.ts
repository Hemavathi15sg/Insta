import { validateTag } from '../validation';

describe('validateTag', () => {
  describe('valid tags', () => {
    it('should return a valid tag under 20 characters', () => {
      const tag = 'nature';
      const result = validateTag(tag);
      
      expect(result).toBe('nature');
    });

    it('should trim whitespace from valid tags', () => {
      const tag = '  sunset  ';
      const result = validateTag(tag);
      
      expect(result).toBe('sunset');
    });

    it('should accept tags with numbers', () => {
      const tag = 'travel2024';
      const result = validateTag(tag);
      
      expect(result).toBe('travel2024');
    });

    it('should accept tags with special characters', () => {
      const tag = 'food&drink';
      const result = validateTag(tag);
      
      expect(result).toBe('food&drink');
    });

    it('should return exactly 20 characters for a 20-character tag', () => {
      const tag = '12345678901234567890'; // exactly 20 chars
      const result = validateTag(tag);
      
      expect(result).toBe('12345678901234567890');
      expect(result?.length).toBe(20);
    });
  });

  describe('empty tags', () => {
    it('should return null for undefined', () => {
      const result = validateTag(undefined);
      
      expect(result).toBeNull();
    });

    it('should return null for null', () => {
      const result = validateTag(null);
      
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const tag = '';
      const result = validateTag(tag);
      
      expect(result).toBeNull();
    });

    it('should return null for whitespace-only string', () => {
      const tag = '   ';
      const result = validateTag(tag);
      
      expect(result).toBeNull();
    });

    it('should return null for tabs and newlines', () => {
      const tag = '\t\n\r';
      const result = validateTag(tag);
      
      expect(result).toBeNull();
    });
  });

  describe('too-long tags', () => {
    it('should truncate tags longer than 20 characters', () => {
      const tag = '123456789012345678901234567890'; // 30 chars
      const result = validateTag(tag);
      
      expect(result).toBe('12345678901234567890');
      expect(result?.length).toBe(20);
    });

    it('should truncate tags at exactly 21 characters to 20', () => {
      const tag = '123456789012345678901'; // 21 chars
      const result = validateTag(tag);
      
      expect(result).toBe('12345678901234567890');
      expect(result?.length).toBe(20);
    });

    it('should truncate very long tags', () => {
      const tag = 'this is a very long tag that exceeds the maximum allowed length';
      const result = validateTag(tag);
      
      expect(result).toBe('this is a very long ');
      expect(result?.length).toBe(20);
    });

    it('should trim whitespace before checking length', () => {
      const tag = '  123456789012345678901234  '; // 21 chars after trim
      const result = validateTag(tag);
      
      expect(result).toBe('12345678901234567890');
      expect(result?.length).toBe(20);
    });
  });

  describe('type coercion', () => {
    it('should convert numbers to strings', () => {
      const tag = 12345;
      const result = validateTag(tag);
      
      expect(result).toBe('12345');
    });

    it('should convert boolean to string', () => {
      const tag = true;
      const result = validateTag(tag);
      
      expect(result).toBe('true');
    });

    it('should handle objects by converting to string', () => {
      const tag = { key: 'value' };
      const result = validateTag(tag);
      
      expect(result).toBe('[object Object]');
    });
  });
});
