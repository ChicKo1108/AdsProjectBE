# ResponseUtils 使用指南

## 概述

`ResponseUtils` 是一个通用的API响应工具类，用于统一处理所有API的响应格式，确保每个响应都包含 `success` 字段。

## 响应格式

所有API响应都遵循以下统一格式：

```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

## 使用方法

### 1. 引入工具类

```javascript
const ResponseUtils = require('../utils/responseUtils');
```

### 2. 成功响应

#### 基本成功响应
```javascript
// 默认200状态码
return ResponseUtils.success(res, 200, '操作成功', data);

// 简化写法（使用默认参数）
return ResponseUtils.success(res);
```

#### 创建成功响应（201状态码）
```javascript
return ResponseUtils.created(res, '创建成功', { id: newId });
```

### 3. 错误响应

#### 基本错误响应
```javascript
// 400 Bad Request
return ResponseUtils.badRequest(res, '请求参数错误');

// 401 Unauthorized
return ResponseUtils.unauthorized(res, '未授权访问');

// 403 Forbidden
return ResponseUtils.forbidden(res, '权限不足');

// 404 Not Found
return ResponseUtils.notFound(res, '资源未找到');

// 500 Internal Server Error
return ResponseUtils.serverError(res, '服务器内部错误');
```

#### 自定义错误响应
```javascript
return ResponseUtils.error(res, 422, '数据验证失败', validationErrors);
```

## 方法列表

### 成功响应方法

| 方法 | 状态码 | 描述 |
|------|--------|------|
| `success(res, statusCode, message, data, code)` | 200 | 通用成功响应 |
| `created(res, message, data)` | 201 | 创建成功响应 |

### 错误响应方法

| 方法 | 状态码 | 描述 |
|------|--------|------|
| `error(res, statusCode, message, data, code)` | 自定义 | 通用错误响应 |
| `badRequest(res, message, data)` | 400 | 请求参数错误 |
| `unauthorized(res, message, data)` | 401 | 未授权访问 |
| `forbidden(res, message, data)` | 403 | 权限不足 |
| `notFound(res, message, data)` | 404 | 资源未找到 |
| `serverError(res, message, data)` | 500 | 服务器内部错误 |

## 实际使用示例

### Controller 示例

```javascript
const ResponseUtils = require('../utils/responseUtils');
const SomeService = require('../services/someService');

class SomeController {
  static async create(req, res) {
    try {
      const { name, description } = req.body;
      
      // 参数验证
      if (!name) {
        return ResponseUtils.badRequest(res, '名称不能为空');
      }
      
      // 调用服务层
      const result = await SomeService.create({ name, description });
      
      if (!result.success) {
        return ResponseUtils.badRequest(res, result.message);
      }
      
      // 成功响应
      return ResponseUtils.created(res, '创建成功', {
        id: result.data.id,
        name: result.data.name
      });
      
    } catch (error) {
      logger.error(`创建失败: ${error.message}`);
      return ResponseUtils.serverError(res, '创建失败');
    }
  }
  
  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await SomeService.findById(id);
      
      if (!result) {
        return ResponseUtils.notFound(res, '资源未找到');
      }
      
      return ResponseUtils.success(res, 200, '查询成功', result);
      
    } catch (error) {
      logger.error(`查询失败: ${error.message}`);
      return ResponseUtils.serverError(res, '查询失败');
    }
  }
}
```

### 中间件示例

```javascript
const ResponseUtils = require('../utils/responseUtils');

function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  
  if (!token) {
    return ResponseUtils.unauthorized(res, '未提供认证令牌');
  }
  
  // 验证token逻辑...
  
  next();
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return ResponseUtils.forbidden(res, '权限不足，需要管理员权限');
  }
  
  next();
}
```

## 注意事项

1. **统一使用**: 所有Controller都应该使用 `ResponseUtils` 来处理响应，确保格式统一
2. **返回语句**: 使用 `return ResponseUtils.xxx()` 确保函数正确结束
3. **错误处理**: 在 `catch` 块中使用 `serverError` 方法处理未预期的错误
4. **参数验证**: 使用 `badRequest` 方法处理参数验证错误
5. **权限验证**: 使用 `unauthorized` 和 `forbidden` 方法处理权限相关错误

## 迁移指南

如果你有现有的Controller需要迁移到使用 `ResponseUtils`，请按以下步骤操作：

1. 在Controller文件顶部引入 `ResponseUtils`
2. 将所有 `res.status().json()` 调用替换为对应的 `ResponseUtils` 方法
3. 确保所有响应都使用 `return` 语句
4. 测试API确保响应格式正确

### 迁移前后对比

**迁移前：**
```javascript
res.status(400).json({
  code: 400,
  message: '参数错误',
  data: null
});
```

**迁移后：**
```javascript
return ResponseUtils.badRequest(res, '参数错误');
```

通过使用 `ResponseUtils`，我们确保了所有API响应都包含 `success` 字段，并且格式统一，提高了API的一致性和可维护性。