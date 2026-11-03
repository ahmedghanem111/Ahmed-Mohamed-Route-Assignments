import { EncryptionService } from './encryption.service.js';

describe('EncryptionService', () => {
  const config = {
    getOrThrow: () => Buffer.alloc(32, 7).toString('base64'),
  } as never;
  const service = new EncryptionService(config);

  it('round-trips encrypted values', () => {
    const encrypted = service.encrypt('sensitive value');
    expect(encrypted).not.toContain('sensitive value');
    expect(service.decrypt(encrypted)).toBe('sensitive value');
  });

  it('rejects data with a modified authentication tag', () => {
    const [iv, tag, ciphertext] = service.encrypt('sensitive value').split('.');
    const first = tag[0] === 'A' ? 'B' : 'A';
    expect(() => service.decrypt(`${iv}.${first}${tag.slice(1)}.${ciphertext}`)).toThrow();
  });
});
