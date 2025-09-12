const request = require('supertest');
const app = require('../app');
const knex = require('../models/knex');
const bcrypt = require('bcryptjs');
const { AD_PLAN_ENUMS } = require('../utils/constants');

describe('广告计划管理测试', () => {
  let adminToken;
  let userToken;
  let testAdPlanId;
  let testAdGroupId;
  
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
    
    // 创建测试广告组
    const [adGroupId] = await knex('ad_group').insert({
      name: '测试广告组',
      created_at: new Date(),
      updated_at: new Date()
    });
    testAdGroupId = adGroupId;
    
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
  
  describe('创建广告计划功能测试', () => {
    test('成功创建广告计划 - 有效数据', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告计划',
          plan_type: 'CPC',
          target: 'mobile_app',
          price_stratagy: 'auto_bid',
          placement_type: 'feed',
          status: 1,
          chuang_yi_you_xuan: 0,
          budget: 1000.00,
          cost: 0.00,
          display_count: 0,
          click_count: 0,
          download_count: 0,
          click_per_price: 0.00,
          click_rate: 0.0,
          ecpm: 0.00,
          download_per_count: 0.00,
          download_rate: 0.0,
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('广告计划创建成功');
      expect(response.body.data.ad_plan.name).toBe('测试广告计划');
      expect(response.body.data.ad_plan.target).toBe('mobile_app');
      expect(response.body.data.ad_plan.price_stratagy).toBe('auto_bid');
      
      testAdPlanId = response.body.data.ad_plan.id;
    });
    
    test('创建广告计划失败 - 未提供认证令牌', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .send({
          name: '测试广告计划2',
          plan_type: 'CPM',
          target: 'game',
          price_stratagy: 'manual_bid'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('未提供认证令牌');
    });
    
    test('创建广告计划失败 - 权限不足', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '测试广告计划3',
          plan_type: 'CPA',
          target: 'ecommerce',
          price_stratagy: 'auto_bid'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以创建广告计划');
    });
    
    test('创建广告计划失败 - 名称为空', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          plan_type: 'CPC',
          target: 'mobile_app',
          price_stratagy: 'auto_bid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划名称不能为空');
    });
    
    test('创建广告计划失败 - 计划类型为空', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告计划4',
          plan_type: '',
          target: 'mobile_app',
          price_stratagy: 'auto_bid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('计划类型不能为空');
    });
    
    test('创建广告计划失败 - 目标值无效', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告计划5',
          plan_type: 'CPC',
          target: 'invalid_target',
          price_stratagy: 'auto_bid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('目标值无效');
    });
    
    test('创建广告计划失败 - 价格策略无效', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告计划6',
          plan_type: 'CPC',
          target: 'mobile_app',
          price_stratagy: 'invalid_strategy'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('价格策略无效');
    });
    
    test('创建广告计划失败 - 投放类型为空', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告计划7',
          plan_type: 'CPC',
          target: 'mobile_app',
          price_stratagy: 'auto_bid',
          placement_type: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('投放类型不能为空');
    });
    
    test('创建广告计划失败 - 预算为负数', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试广告计划8',
          plan_type: 'CPC',
          target: 'mobile_app',
          price_stratagy: 'auto_bid',
          placement_type: 'feed',
          budget: -100
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('预算必须为非负数');
    });
  });
  
  describe('修改广告计划功能测试', () => {
    test('成功修改广告计划 - 更新名称', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-plans/${testAdPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '修改后的广告计划名称'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告计划修改成功');
      expect(response.body.data.ad_plan.name).toBe('修改后的广告计划名称');
    });
    
    test('成功修改广告计划 - 更新目标和策略', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-plans/${testAdPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          target: 'game',
          price_stratagy: 'manual_bid'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告计划修改成功');
      expect(response.body.data.ad_plan.target).toBe('game');
      expect(response.body.data.ad_plan.price_stratagy).toBe('manual_bid');
    });
    
    test('成功修改广告计划 - 更新预算和状态', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-plans/${testAdPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          budget: 2000.00,
          status: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告计划修改成功');
      expect(parseFloat(response.body.data.ad_plan.budget)).toBe(2000.00);
      expect(response.body.data.ad_plan.status).toBe(2);
    });
    
    test('修改广告计划失败 - 广告计划ID无效', async () => {
      const response = await request(app)
        .put('/api/admin/ad-plans/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划ID无效');
    });
    
    test('修改广告计划失败 - 广告计划不存在', async () => {
      const response = await request(app)
        .put('/api/admin/ad-plans/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '测试修改'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划不存在');
    });
    
    test('修改广告计划失败 - 目标值无效', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-plans/${testAdPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          target: 'invalid_target'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('目标值无效');
    });
    
    test('修改广告计划失败 - 权限不足', async () => {
      const response = await request(app)
        .put(`/api/admin/ad-plans/${testAdPlanId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '尝试修改'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以修改广告计划');
    });
  });
  
  describe('绑定广告组功能测试', () => {
    test('成功绑定广告组', async () => {
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
    
    test('绑定广告组失败 - 广告组ID列表为空', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: []
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告组ID列表不能为空');
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
    
    test('绑定广告组失败 - 权限不足', async () => {
      const response = await request(app)
        .post(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ad_group_ids: [testAdGroupId]
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以绑定广告组');
    });
  });
  
  describe('删除广告组功能测试', () => {
    let additionalAdGroupId;
    
    beforeEach(async () => {
      // 创建额外的广告组用于删除测试
      const [adGroupId] = await knex('ad_group').insert({
        name: '待删除的广告组',
        created_at: new Date(),
        updated_at: new Date()
      });
      additionalAdGroupId = adGroupId;
      
      // 绑定到广告计划
      await knex('ad_plan_ad_group').insert({
        ad_plan_id: testAdPlanId,
        ad_group_id: additionalAdGroupId,
        created_at: new Date(),
        updated_at: new Date()
      });
    });
    
    test('成功删除广告组', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [additionalAdGroupId]
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toContain('成功删除');
      
      // 验证广告组已被删除
      const deletedGroup = await knex('ad_group')
        .where('id', additionalAdGroupId)
        .first();
      expect(deletedGroup).toBeUndefined();
    });
    
    test('删除广告组失败 - 广告组中还有其他广告计划', async () => {
      // 创建另一个广告计划并绑定同一个广告组
      const [anotherPlanId] = await knex('ad_plan').insert({
        name: '另一个广告计划',
        plan_type: 'CPM',
        target: 'game',
        price_stratagy: 'manual_bid',
        placement_type: 'banner',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await knex('ad_plan_ad_group').insert({
        ad_plan_id: anotherPlanId,
        ad_group_id: additionalAdGroupId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ad_group_ids: [additionalAdGroupId]
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toContain('广告组中还有其他广告计划，不能删除');
      
      // 清理
      await knex('ad_plan_ad_group').where('ad_plan_id', anotherPlanId).del();
      await knex('ad_plan').where('id', anotherPlanId).del();
    });
    
    test('删除广告组失败 - 权限不足', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${testAdPlanId}/ad-groups`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ad_group_ids: [additionalAdGroupId]
        });
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以删除广告组');
    });
  });
  
  describe('删除广告计划功能测试', () => {
    let deleteTestAdPlanId;
    
    beforeEach(async () => {
      // 为删除测试创建一个新的广告计划
      const [planId] = await knex('ad_plan').insert({
        name: '待删除的广告计划',
        plan_type: 'CPA',
        target: 'ecommerce',
        price_stratagy: 'auto_bid',
        placement_type: 'interstitial',
        status: 0,
        budget: 500.00,
        created_at: new Date(),
        updated_at: new Date()
      });
      deleteTestAdPlanId = planId;
    });
    
    test('成功删除广告计划', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${deleteTestAdPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告计划删除成功');
      
      // 验证广告计划已被删除
      const deletedPlan = await knex('ad_plan')
        .where('id', deleteTestAdPlanId)
        .first();
      expect(deletedPlan).toBeUndefined();
    });
    
    test('删除广告计划失败 - 广告计划不存在', async () => {
      const response = await request(app)
        .delete('/api/admin/ad-plans/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(400);
      expect(response.body.message).toBe('广告计划不存在');
    });
    
    test('删除广告计划失败 - 权限不足', async () => {
      const response = await request(app)
        .delete(`/api/admin/ad-plans/${deleteTestAdPlanId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.code).toBe(403);
      expect(response.body.message).toBe('权限不足，只有管理员可以删除广告计划');
    });
  });
  
  describe('数据验证测试', () => {
    test('创建广告计划 - 枚举值验证', async () => {
      const validTargets = Object.values(AD_PLAN_ENUMS.TARGET);
      const validStrategies = Object.values(AD_PLAN_ENUMS.PRICE_STRATEGY);
      
      // 测试有效的枚举值
      for (const target of validTargets) {
        for (const strategy of validStrategies) {
          const response = await request(app)
            .post('/api/admin/ad-plans')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
              name: `测试计划_${target}_${strategy}`,
              plan_type: 'CPC',
              target: target,
              price_stratagy: strategy,
              placement_type: 'feed',
              status: 1
            });
          
          expect(response.status).toBe(201);
          expect(response.body.code).toBe(201);
          
          // 清理创建的数据
          await knex('ad_plan').where('id', response.body.data.ad_plan.id).del();
        }
      }
    });
    
    test('修改广告计划 - 数值字段边界值测试', async () => {
      // 测试零值（应该成功）
      const response = await request(app)
        .put(`/api/admin/ad-plans/${testAdPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          budget: 0,
          cost: 0,
          display_count: 0,
          click_count: 0,
          download_count: 0
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('广告计划修改成功');
    });
    
    test('创建广告计划 - 大数值测试', async () => {
      const response = await request(app)
        .post('/api/admin/ad-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '大数值测试广告计划',
          plan_type: 'CPM',
          target: 'finance',
          price_stratagy: 'manual_bid',
          placement_type: 'video',
          status: 1,
          budget: 999999.99,
          cost: 888888.88,
          display_count: 9999999,
          click_count: 999999,
          download_count: 99999,
          click_per_price: 99.99,
          click_rate: 99.99,
          ecpm: 999.99,
          download_per_count: 99.99,
          download_rate: 99.99
        });
      
      expect(response.status).toBe(201);
      expect(response.body.code).toBe(201);
      expect(response.body.message).toBe('广告计划创建成功');
      
      // 清理
      await knex('ad_plan').where('id', response.body.data.ad_plan.id).del();
    });
  });
});