describe('Required JWT signing secret', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  it.each([undefined, '', '   '])('rejects a missing or blank secret (%s)', secret => {
    if (secret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secret;
    expect(() => jest.isolateModules(() => require('../src/config/env'))).toThrow();
  });

  it('uses the explicitly configured secret', () => {
    process.env.JWT_SECRET = 'test-only-explicit-signing-secret';
    jest.isolateModules(() => {
      expect(require('../src/config/env').env.JWT_SECRET).toBe('test-only-explicit-signing-secret');
    });
  });
});
