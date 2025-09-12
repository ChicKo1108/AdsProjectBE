const request = require('supertest');
const app = require('../app');
const knex = require('../models/knex');
const bcrypt = require('bcryptjs');

describe('广告创意管理测试', () => {
  let adminToken;
  let userToken;
  let testAdCreativeId;
  
  // 测试前准备
  beforeAll(async () => {
    // 清理测试数据
    await knex('ad_creatives').del();
    await knex('user').del();
    
    // 创建测试管理员
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [adminId] = await knex('user').insert({
      username: 'testadmin',
      password: hashedPassword,
      name: '测试管理员',
      role: 'super-admin',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // 创建测试普通用户
    const userPassword = await bcrypt.hash('user123', 10);
    const [userId] = await knex('user').insert({
      username: 'testuser',
      password: userPassword,
      name: '测试用户',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // 获取管理员token
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testadmin',
        password: 'admin123'
      });
    
    adminToken = adminLoginResponse.body.data.token;
    
    // 获取普通用户token
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'user123'
      });
    
    userToken = userLoginResponse.body.data.token;
  });
  
  // 测试后清理
  afterAll(async () => {
    await knex('ad_creatives').del();
    await knex('user').del();
    await knex.destroy();
  });
  
  describe('创建广告创意功能测试', () => {
    test('成功创建广告创意 - 有效数据', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告创意',
          display_id: 'TEST_AD_001',
          status: 1,
          budget: 1000.00,
          download_cost: 2.50,
          click_cost: 0.45,
          costs: 0.00,
          download_count: 0,
          download_rate: 0.0,
          ecpm: 0.00,
          display_count: 0,
          click_count: 0,
          click_rate: 0.0
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('广告创意创建成功');
      expect(response.body.data.ad_creative.name).toBe('测试广告创意');
      expect(response.body.data.ad_creative.display_id).toBe('TEST_AD_001');
      expect(response.body.data.ad_creative.status).toBe(1);
      
      testAdCreativeId = response.body.data.ad_creative.id;
    });
    
    test('创建广告创意失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .send({
          name: '测试广告创意2',
          display_id: 'TEST_AD_002',
          status: 1
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
    
    test('创建广告创意失败 - 权限不足', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '测试广告创意3',
          display_id: 'TEST_AD_003',
          status: 1
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以创建广告创意');
    });
    
    test('创建广告创意失败 - 名称为空', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          display_id: 'TEST_AD_004',
          status: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意名称不能为空');
    });
    
    test('创建广告创意失败 - 展示ID为空', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告创意5',
          display_id: '',
          status: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('展示ID不能为空');
    });
    
    test('创建广告创意失败 - 状态值无效', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告创意6',
          display_id: 'TEST_AD_006',
          status: 2
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('状态值必须为0或1');
    });
    
    test('创建广告创意失败 - 预算为负数', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告创意7',
          display_id: 'TEST_AD_007',
          status: 1,
          budget: -100
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('预算必须为非负数');
    });
    
    test('创建广告创意失败 - 名称已存在', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告创意', // 已存在的名称
          display_id: 'TEST_AD_008',
          status: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意名称已存在');
    });
    
    test('创建广告创意失败 - 展示ID已存在', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告创意9',
          display_id: 'TEST_AD_001', // 已存在的展示ID
          status: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('展示ID已存在');
    });
  });
  
  describe('修改广告创意功能测试', () => {
    test('成功修改广告创意 - 更新名称', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '修改后的广告创意名称'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告创意修改成功');
      expect(response.body.data.ad_creative.name).toBe('修改后的广告创意名称');
    });
    
    test('成功修改广告创意 - 更新状态', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 0
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告创意修改成功');
      expect(response.body.data.ad_creative.status).toBe(0);
    });
    
    test('成功修改广告创意 - 更新预算和成本', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          budget: 2000.00,
          download_cost: 3.00,
          click_cost: 0.60
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告创意修改成功');
      expect(parseFloat(response.body.data.ad_creative.budget)).toBe(2000.00);
    });
    
    test('修改广告创意失败 - 广告创意ID无效', async () => {
      const response = await request(app)
        .put('/api/admin/ad-creatives/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意ID无效');
    });
    
    test('修改广告创意失败 - 广告创意不存在', async () => {
      const response = await request(app)
        .put('/api/admin/ad-creatives/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意不存在');
    });
    
    test('修改广告创意失败 - 名称为空', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意名称不能为空');
    });
    
    test('修改广告创意失败 - 状态值无效', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 3
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('状态值必须为0或1');
    });
    
    test('修改广告创意失败 - 预算为负数', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          budget: -500
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('预算必须为非负数');
    });
    
    test('修改广告创意失败 - 权限不足', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '尝试修改'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以修改广告创意');
    });
  });
  
  describe('删除广告创意功能测试', () => {
    let deleteTestAdCreativeId;
    
    beforeEach(async () => {
      // 为删除测试创建一个新的广告创意
      const [creativeId] = await knex('ad_creatives').insert({
        name: '待删除的广告创意',
        display_id: 'DELETE_TEST_001',
        status: 1,
        budget: 500.00,
        created_at: new Date(),
        updated_at: new Date()
      });
      deleteTestAdCreativeId = creativeId;
    });
    
    test('成功删除广告创意', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-creatives/${deleteTestAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告创意删除成功');
      
      // 验证广告创意已被删除
      const deletedCreative = await knex('ad_creatives')
        .where('id', deleteTestAdCreativeId)
        .first();
      expect(deletedCreative).toBeUndefined();
    });
    
    test('删除广告创意失败 - 广告创意ID无效', async () => {
      const response = await request(app)
        .delete('/api/admin/ad-creatives/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意ID无效');
    });
    
    test('删除广告创意失败 - 广告创意不存在', async () => {
      const response = await request(app)
        .delete('/api/admin/ad-creatives/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告创意不存在');
    });
    
    test('删除广告创意失败 - 权限不足', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-creatives/${deleteTestAdCreativeId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以删除广告创意');
    });
    
    test('删除广告创意失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-creatives/${deleteTestAdCreativeId}`);
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
  });
  
  describe('数据验证测试', () => {
    test('创建广告创意 - 所有数值字段验证', async () => {
      const numericFields = {
        budget: -1,
        download_cost: -1,
        click_cost: -1,
        costs: -1,
        download_count: -1,
        download_rate: -1,
        ecpm: -1,
        display_count: -1,
        click_count: -1,
        click_rate: -1
      };
      
      for (const [field, value] of Object.entries(numericFields)) {
        const response = await request(app)
          .post('/api/admin/ad-creatives')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `测试${field}`,
            display_id: `TEST_${field.toUpperCase()}`,
            status: 1,
            [field]: value
          });
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe(400);
        expect(response.body.message).toContain('必须为非负数');
      }
    });
    
    test('修改广告创意 - 数值字段边界值测试', async () => {
      // 测试零值（应该成功）
      const response = await request(app)
        .put(`/api/admin/ad-creatives/${testAdCreativeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          budget: 0,
          download_cost: 0,
          click_cost: 0
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告创意修改成功');
    });
    
    test('创建广告创意 - 大数值测试', async () => {
      const response = await request(app)
        .post('/api/admin/ad-creatives')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '大数值测试广告创意',
          display_id: 'BIG_NUMBER_TEST',
          status: 1,
          budget: 999999.99,
          download_cost: 999.99,
          click_cost: 99.99,
          costs: 888888.88,
          download_count: 999999,
          download_rate: 99.99,
          ecpm: 999.99,
          display_count: 9999999,
          click_count: 999999,
          click_rate: 99.99
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('广告创意创建成功');
    });
  });
});