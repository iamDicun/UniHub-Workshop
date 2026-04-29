import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/user.repository.js', () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn()
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: jest.fn() }
}));

const repo = await import('../../src/repositories/user.repository.js');
const jwt = (await import('jsonwebtoken')).default;
const { loginUser, getUserProfile } = await import('../../src/services/auth.service.js');

describe('auth.service.js', () => {
  describe('loginUser', () => {
    it('should login and return token', async () => {
      repo.findUserByEmail.mockResolvedValue({
        id: 1, email: 'test@test.com', password_hash: '123456', role: 'student', name: 'Test'
      });
      jwt.sign.mockReturnValue('mock-token');

      const result = await loginUser('test@test.com', '123456');
      expect(result.token).toBe('mock-token');
      expect(result.user.id).toBe(1);
    });

    it('should throw if wrong password', async () => {
      repo.findUserByEmail.mockResolvedValue({ password_hash: '123456' });
      await expect(loginUser('test@test.com', 'wrong')).rejects.toThrow('Mật khẩu không chính xác!');
    });

    it('should throw if user not found', async () => {
      repo.findUserByEmail.mockResolvedValue(null);
      await expect(loginUser('test@test.com', 'wrong')).rejects.toThrow('Email không tồn tại!');
    });
  });

  describe('getUserProfile', () => {
    it('should get profile', async () => {
      repo.findUserById.mockResolvedValue({ id: 1 });
      const user = await getUserProfile(1);
      expect(user.id).toBe(1);
    });

    it('should throw if user not found', async () => {
      repo.findUserById.mockResolvedValue(null);
      await expect(getUserProfile(1)).rejects.toThrow('User không tồn tại!');
    });
  });
});
