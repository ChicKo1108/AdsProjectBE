# 控制器迁移到ResponseUtils示例

本文档提供了将现有控制器迁移到使用ResponseUtils的具体示例和步骤。

## 迁移步骤

### 1. 引入ResponseUtils

在控制器文件顶部添加：
```javascript
const ResponseUtils = require('../utils/responseUtils');
// 或者对于admin目录下的控制器
const ResponseUtils = require('../../utils/responseUtils');
```

### 2. 替换响应代码

将所有 `res.status().json()` 和 `res.json()` 调用替换为对应的ResponseUtils方法。

## 具体迁移示例

### 示例1: user.js 控制器迁移

**迁移前：**
```javascript
// 引用用户模版数据
const User = require('../models/user.js');

const userController = {
  // showUser 获取用户数据并返回到页面
  showUser: async function(req,res,next){
    try{
      let userData = await User.all()
      res.json({
        code: 200,
        message: "操作成功",
        data: userData
      })
    }catch(e){
      res.json({ code: 0, message: "操作失败", data: e })
    }
  },
}

module.exports = userController;
```

**迁移后：**
```javascript
// 引用用户模版数据
const User = require('../models/user.js');
const ResponseUtils = require('../utils/responseUtils');

const userController = {
  // showUser 获取用户数据并返回到页面
  showUser: async function(req, res, next) {
    try {
      let userData = await User.all();
      return ResponseUtils.success(res, 200, '操作成功', userData);
    } catch (e) {
      console.error('获取用户数据失败:', e);
      return ResponseUtils.serverError(res, '操作失败');
    }
  },
}

module.exports = userController;
```

### 示例2: adPlan.js 控制器迁移

**迁移前：**
```javascript
static async getAdPlanList(req, res) {
  try {
    // 参数验证
    if (page) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          code: 400,
          message: '页码必须是大于0的整数',
          data: null
        });
      }
      queryParams.page = pageNum;
    }
    
    // 调用service获取分页数据
    const result = await AdPlanService.getAdPlanList(queryParams);

    res.json({
      code: 200,
      message: 'success',
      data: result
    });

  } catch (error) {
    console.error('获取广告计划列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取广告计划列表失败',
      data: null
    });
  }
}
```

**迁移后：**
```javascript
const ResponseUtils = require('../utils/responseUtils');

static async getAdPlanList(req, res) {
  try {
    // 参数验证
    if (page) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return ResponseUtils.badRequest(res, '页码必须是大于0的整数');
      }
      queryParams.page = pageNum;
    }
    
    // 调用service获取分页数据
    const result = await AdPlanService.getAdPlanList(queryParams);

    return ResponseUtils.success(res, 200, '获取成功', result);

  } catch (error) {
    console.error('获取广告计划列表失败:', error);
    return ResponseUtils.serverError(res, '获取广告计划列表失败');
  }
}
```

### 示例3: 处理不同的响应格式

**迁移前（混合格式）：**
```javascript
static async getAdPlanDetail(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: '无效的广告计划ID'
      });
    }

    const adPlan = await AdPlan.findById(parseInt(id));

    if (!adPlan) {
      return res.status(404).json({
        success: false,
        message: '广告计划不存在'
      });
    }

    res.json({
      success: true,
      data: { adPlan }
    });

  } catch (error) {
    console.error('获取广告计划详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
}
```

**迁移后（统一格式）：**
```javascript
const ResponseUtils = require('../utils/responseUtils');

static async getAdPlanDetail(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return ResponseUtils.badRequest(res, '无效的广告计划ID');
    }

    const adPlan = await AdPlan.findById(parseInt(id));

    if (!adPlan) {
      return ResponseUtils.notFound(res, '广告计划不存在');
    }

    return ResponseUtils.success(res, 200, '获取成功', { adPlan });

  } catch (error) {
    console.error('获取广告计划详情失败:', error);
    return ResponseUtils.serverError(res, '服务器内部错误');
  }
}
```

## 常见迁移模式

### 1. 参数验证错误
```javascript
// 迁移前
return res.status(400).json({
  code: 400,
  message: '参数错误',
  data: null
});

// 迁移后
return ResponseUtils.badRequest(res, '参数错误');
```

### 2. 成功响应
```javascript
// 迁移前
res.json({
  code: 200,
  message: '操作成功',
  data: result
});

// 迁移后
return ResponseUtils.success(res, 200, '操作成功', result);
```

### 3. 创建成功响应
```javascript
// 迁移前
res.status(201).json({
  code: 201,
  message: '创建成功',
  data: { id: newId }
});

// 迁移后
return ResponseUtils.created(res, '创建成功', { id: newId });
```

### 4. 资源未找到
```javascript
// 迁移前
return res.status(404).json({
  code: 404,
  message: '资源未找到',
  data: null
});

// 迁移后
return ResponseUtils.notFound(res, '资源未找到');
```

### 5. 服务器错误
```javascript
// 迁移前
res.status(500).json({
  code: 500,
  message: '服务器内部错误',
  data: null
});

// 迁移后
return ResponseUtils.serverError(res, '服务器内部错误');
```

### 6. 权限相关错误
```javascript
// 迁移前 - 未授权
return res.status(401).json({
  code: 401,
  message: '未授权访问',
  data: null
});

// 迁移后
return ResponseUtils.unauthorized(res, '未授权访问');

// 迁移前 - 权限不足
return res.status(403).json({
  code: 403,
  message: '权限不足',
  data: null
});

// 迁移后
return ResponseUtils.forbidden(res, '权限不足');
```

## 迁移检查清单

在完成迁移后，请检查以下项目：

- [ ] 已在文件顶部引入ResponseUtils
- [ ] 所有 `res.status().json()` 调用已替换
- [ ] 所有 `res.json()` 调用已替换
- [ ] 所有响应都使用 `return` 语句
- [ ] 错误处理使用了适当的ResponseUtils方法
- [ ] 成功响应使用了适当的ResponseUtils方法
- [ ] 测试API确保响应格式正确
- [ ] 响应中包含了success字段

## 批量迁移脚本建议

如果需要迁移大量文件，可以考虑编写脚本来自动化部分工作：

1. 自动添加ResponseUtils引入语句
2. 自动替换常见的响应模式
3. 生成迁移报告

但请注意，自动化脚本可能无法处理所有复杂情况，建议手动检查每个迁移的文件。

## 测试建议

迁移完成后，建议：

1. 运行现有的单元测试
2. 手动测试API端点
3. 检查响应格式是否符合预期
4. 确认success字段在所有响应中都存在
5. 验证错误处理是否正常工作

通过遵循这些示例和步骤，可以确保所有控制器都能成功迁移到使用ResponseUtils，从而实现统一的API响应格式。