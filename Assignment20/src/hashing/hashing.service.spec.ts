import { HashingService } from './hashing.service.js';

describe('HashingService', () => {
  const service = new HashingService();

  it('hashes passwords with a verifiable Argon2id hash', async () => {
    const hash = await service.hash('a long password value');

    expect(hash).not.toContain('a long password value');
    expect(await service.compare(hash, 'a long password value')).toBe(true);
    expect(await service.compare(hash, 'incorrect password')).toBe(false);
  });
});
