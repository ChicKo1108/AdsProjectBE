const request = require('supertest');
const app = require('../app');
const knex = require('../models/knex');
const bcrypt = require('bcryptjs');

describe('认证和用户管理测试', () => {
  let adminToken;
  let testUserId;
  
  // 测试前准备
  beforeAll(async () => {
    // 清理测试数据
    await knex('user').del();
    
    // 创建测试超级管理员
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminId] = await knex('user').insert({
      username: 'testadmin',
      password: hashedPassword,
      name: '测试管理员',
      role: 'super-admin',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // 获取管理员token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testadmin',
        password: 'admin123'
      });
    
    adminToken = loginResponse.body.data.token;
  });
  
  // 测试后清理
  afterAll(async () => {
    await knex('user').del();
    await knex.destroy();
  });
  
  describe('登录功能测试', () => {
    test('成功登录 - 有效的用户名和密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'admin123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data.token).toBeDefined();
    });
    
    test('登录失败 - 用户名为空', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '',
          password: 'admin123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('用户名不能为空');
    });
    
    test('登录失败 - 密码为空', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('密码不能为空');
    });
    
    test('登录失败 - 用户不存在', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('用户不存在');
    });
    
    test('登录失败 - 密码错误', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('密码不正确');
    });
  });
  
  describe('超管创建用户功能测试', () => {
    test('成功创建用户 - 有效数据', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser1',
          password: 'user123',
          name: '测试用户1',
          role: 'user'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('用户创建成功');
      expect(response.body.data.user.username).toBe('testuser1');
      expect(response.body.data.user.name).toBe('测试用户1');
      expect(response.body.data.user.role).toBe('user');
      
      testUserId = response.body.data.user.id;
    });
    
    test('创建用户失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .send({
          username: 'testuser2',
          password: 'user123',
          name: '测试用户2',
          role: 'user'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
    
    test('创建用户失败 - 用户名为空', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: '',
          password: 'user123',
          name: '测试用户',
          role: 'user'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('用户名不能为空');
    });
    
    test('创建用户失败 - 密码为空', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser3',
          password: '',
          name: '测试用户3',
          role: 'user'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('密码不能为空');
    });
    
    test('创建用户失败 - 姓名为空', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser4',
          password: 'user123',
          name: '',
          role: 'user'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('姓名不能为空');
    });
    
    test('创建用户失败 - 无效角色', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser5',
          password: 'user123',
          name: '测试用户5',
          role: 'invalid-role'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('角色必须是 user, admin 或 super-admin');
    });
    
    test('创建用户失败 - 用户名已存在', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'testuser1', // 已存在的用户名
          password: 'user123',
          name: '重复用户',
          role: 'user'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('用户名已存在');
    });
  });
  
  describe('修改用户功能测试', () => {
    test('成功修改用户 - 更新姓名', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '修改后的用户名'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('用户修改成功');
      expect(response.body.data.user.name).toBe('修改后的用户名');
    });
    
    test('成功修改用户 - 更新密码', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'newpassword123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('用户修改成功');
    });
    
    test('成功修改用户 - 更新角色', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('用户修改成功');
      expect(response.body.data.user.role).toBe('admin');
    });
    
    test('修改用户失败 - 用户ID无效', async () => {
      const response = await request(app)
        .put('/api/admin/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('用户ID无效');
    });
    
    test('修改用户失败 - 用户不存在', async () => {
      const response = await request(app)
        .put('/api/admin/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('用户不存在');
    });
    
    test('修改用户失败 - 姓名为空', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('姓名不能为空');
    });
    
    test('修改用户失败 - 无效角色', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid-role'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('角色必须是 user, admin 或 super-admin');
    });
    
    test('修改用户失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
  });
  
  describe('权限验证测试', () => {
    let userToken;
    
    beforeAll(async () => {
      // 创建普通用户并获取token
      const hashedPassword = await bcrypt.hash('user123', 10);
      await knex('user').insert({
        username: 'normaluser',
        password: hashedPassword,
        name: '普通用户',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'normaluser',
          password: 'user123'
        });
      
      userToken = loginResponse.body.data.token;
    });
    
    test('普通用户无法创建用户', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          username: 'testuser6',
          password: 'user123',
          name: '测试用户6',
          role: 'user'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有超级管理员可以创建用户');
    });
    
    test('普通用户无法修改用户', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '尝试修改'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有超级管理员可以修改用户');
    });
  });
});