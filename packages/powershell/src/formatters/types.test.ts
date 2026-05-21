import { describe, it, expect } from 'vitest';
import { POWERSHELL_LANGUAGE_IDS, SUPPORTED_DOCUMENT_SCHEMES } from './types';

describe('types constants', () => {
  describe('POWERSHELL_LANGUAGE_IDS', () => {
    it('contém powershell', () => {
      expect(POWERSHELL_LANGUAGE_IDS).toContain('powershell');
    });

    it('é um array não vazio', () => {
      expect(POWERSHELL_LANGUAGE_IDS.length).toBeGreaterThan(0);
    });
  });

  describe('SUPPORTED_DOCUMENT_SCHEMES', () => {
    it('contém file e untitled', () => {
      expect(SUPPORTED_DOCUMENT_SCHEMES).toContain('file');
      expect(SUPPORTED_DOCUMENT_SCHEMES).toContain('untitled');
    });

    it('é um array não vazio', () => {
      expect(SUPPORTED_DOCUMENT_SCHEMES.length).toBeGreaterThan(0);
    });
  });
});
