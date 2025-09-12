const request = require('supertest');
const app = require('../app');
const knex = require('../models/knex');
const bcrypt = require('bcryptjs');

describe('广告组管理测试', () => {
  let adminToken;
  let userToken;
  let testAdGroupId;
  let testAdPlanId;
  
  // 测试前准备
  beforeAll(async () => {
    // 清理测试数据
    await knex('ad_plan_ad_group').del();
    await knex('ad_plan').del();
    await knex('ad_group').del();
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
    
    // 创建测试广告计划
    const [adPlanId] = await knex('ad_plan').insert({
      name: '测试广告计划',
      plan_type: 'CPC',
      target: 'mobile_app',
      price_stratagy: 'auto_bid',
      placement_type: 'feed',
      status: 1,
      created_at: new Date(),
      updated_at: new Date()
    });
    testAdPlanId = adPlanId;
    
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
    await knex('ad_plan_ad_group').del();
    await knex('ad_plan').del();
    await knex('ad_group').del();
    await knex('user').del();
    await knex.destroy();
  });
  
  describe('绑定广告组功能测试', () => {
    test('成功绑定广告组 - 有效数据', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [testAdGroupId]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告组绑定成功');
    });
    
    test('绑定广告组失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .send({
          ad_group_ids: [testAdGroupId]
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
    
    test('绑定广告组失败 - 权限不足', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ad_group_ids: [testAdGroupId]
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，需要管理员权限');
    });
    
    test('绑定广告组失败 - 广告计划ID无效', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans/invalid-id/ad-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [testAdGroupId]
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划ID无效');
    });
    
    test('绑定广告组失败 - 广告组ID格式无效', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: ['invalid-id']
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告组ID必须是有效的正整数');
    });
    
    test('绑定广告组失败 - 广告组不存在', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [99999]
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('广告组不存在');
    });
    
    test('绑定广告组成功 - 空数组', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: []
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告组绑定成功');
    });
    
    test('绑定广告组失败 - 广告计划不存在', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans/99999/ad-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [testAdGroupId]
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划不存在');
    });
  });
  
  describe('删除广告组功能测试', () => {
    let deleteTestAdGroupId;
    
    beforeEach(async () => {
      // 为删除测试创建一个新的广告组
      const [groupId] = await knex('ad_group').insert({
        name: '待删除的广告组',
        created_at: new Date(),
        updated_at: new Date()
      });
      deleteTestAdGroupId = groupId;
      
      // 绑定到广告计划
      await knex('ad_plan_ad_group').insert({
        ad_plan_id: testAdPlanId,
        ad_group_id: deleteTestAdGroupId,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
    
    test('成功删除广告组', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [deleteTestAdGroupId]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toContain('成功删除');
    });
    
    test('删除广告组失败 - 广告计划ID无效', async () => {
      const response = await request(app)
        .delete('/api/admin/ad-plans/invalid-id/ad-groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [deleteTestAdGroupId]
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划ID无效');
    });
    
    test('删除广告组失败 - 广告组ID格式无效', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: ['invalid-id']
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告组ID必须为有效的正整数');
    });
    
    test('删除广告组失败 - 权限不足', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ad_group_ids: [deleteTestAdGroupId]
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以删除广告组');
    });
    
    test('删除广告组失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .send({
          ad_group_ids: [deleteTestAdGroupId]
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
    
  });
    

  





});