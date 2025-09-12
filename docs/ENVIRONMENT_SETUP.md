# 环境变量配置指南

本项目使用环境变量来管理不同环境下的配置，支持开发环境（development）和生产环境（production）的分离配置。

## 环境文件说明

### 文件结构
```
├── .env.development     # 开发环境配置
├── .env.production      # 生产环境配置
├── .env.example         # 配置模板文件
└── docs/
    └── ENVIRONMENT_SETUP.md  # 本文档
```

### 环境文件优先级
1. 根据 `NODE_ENV` 环境变量自动选择对应的配置文件
2. `NODE_ENV=production` → 加载 `.env.production`
3. `NODE_ENV=development` 或未设置 → 加载 `.env.development`

## 快速开始

### 1. 复制配置模板
```bash
# 复制开发环境配置
cp .env.example .env.development

# 复制生产环境配置
cp .env.example .env.production
```

### 2. 编辑配置文件
根据你的实际环境修改相应的配置文件：

#### 开发环境 (.env.development)
```bash
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ads

# JWT密钥（开发环境）
JWT_SECRET=your_dev_jwt_secret

# 应用端口
PORT=3000
```

#### 生产环境 (.env.production)
```bash
# 数据库配置
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=your-production-user
DB_PASSWORD=your-secure-password
DB_NAME=ads_production

# JWT密钥（生产环境 - 必须使用强密钥）
JWT_SECRET=your-super-secure-jwt-secret

# 应用端口
PORT=8080
```

### 3. 验证配置
```bash
# 检查开发环境配置
npm run check-env:dev

# 检查生产环境配置
npm run check-env:prod
```

## 配置项说明

### 必需配置项
以下配置项是必须设置的：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `DB_HOST` | 数据库主机地址 | `127.0.0.1` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `your_password` |
| `DB_NAME` | 数据库名称 | `ads` |
| `JWT_SECRET` | JWT签名密钥 | `your_jwt_secret` |

### 应用配置
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 应用端口 | `3000` |
| `APP_NAME` | 应用名称 | `广告管理平台` |
| `APP_VERSION` | 应用版本 | `1.0.0` |

### 数据库连接池配置
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `DB_POOL_MIN` | 最小连接数 | `2` |
| `DB_POOL_MAX` | 最大连接数 | `10` |
| `DB_POOL_IDLE_TIMEOUT` | 空闲超时时间(ms) | `30000` |
| `DB_POOL_ACQUIRE_TIMEOUT` | 获取连接超时时间(ms) | `60000` |

### 安全配置
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_EXPIRES_IN` | JWT过期时间 | `24h` |
| `SESSION_SECRET` | 会话密钥 | - |
| `ENCRYPTION_KEY` | 加密密钥 | - |
| `HTTPS_ENABLED` | 是否启用HTTPS | `false` |

### 日志配置
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `LOG_LEVEL` | 日志级别 | `debug` |
| `LOG_FILE_PATH` | 日志文件路径 | `./logs/app.log` |
| `LOG_MAX_SIZE` | 日志文件最大大小 | `100m` |
| `LOG_MAX_FILES` | 日志文件最大数量 | `10` |

### CORS配置
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `CORS_ORIGIN` | 允许的源 | `http://localhost:5173` |
| `CORS_CREDENTIALS` | 是否允许凭证 | `true` |

## 运行命令

### 开发环境
```bash
# 启动开发服务器
npm run start:dev
# 或使用 nodemon 自动重启
npm run dev

# 运行数据库迁移
npm run migrate:dev

# 运行种子数据
npm run seed:dev
```

### 生产环境
```bash
# 启动生产服务器
npm run start:prod

# 运行数据库迁移
npm run migrate:prod

# 运行种子数据
npm run seed:prod
```

### 测试环境
```bash
# 运行测试
npm test

# 运行特定测试
npm run test:auth
npm run test:ad-creatives
```

## 安全注意事项

### 1. 密钥安全
- **开发环境**: 可以使用相对简单的密钥，但不要使用默认值
- **生产环境**: 必须使用强密钥，建议使用密钥生成工具

```bash
# 生成安全的JWT密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. 数据库安全
- 生产环境数据库密码必须足够复杂
- 建议使用专用的数据库用户，不要使用root用户
- 启用SSL连接（设置 `DB_SSL=true`）

### 3. 文件权限
```bash
# 设置环境文件的安全权限
chmod 600 .env.development
chmod 600 .env.production
```

### 4. 版本控制
- 环境文件已添加到 `.gitignore`，不会被提交到版本控制
- 只有 `.env.example` 会被提交，作为配置模板

## 故障排除

### 1. 环境变量未加载
```bash
# 检查环境文件是否存在
ls -la .env.*

# 验证环境变量
npm run check-env
```

### 2. 数据库连接失败
```bash
# 检查数据库配置
npm run check-env:dev

# 测试数据库连接
npm run migrate:dev
```

### 3. JWT错误
- 确保 `JWT_SECRET` 已正确设置
- 开发和生产环境应使用不同的密钥
- 密钥长度建议至少32个字符

### 4. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 修改端口配置
# 编辑 .env.development 中的 PORT 值
```

## 部署建议

### 1. 容器化部署
```dockerfile
# Dockerfile 示例
FROM node:16-alpine

# 复制应用代码
COPY . /app
WORKDIR /app

# 安装依赖
RUN npm ci --only=production

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "run", "start:prod"]
```

### 2. 环境变量注入
```bash
# 使用环境变量覆盖配置
export NODE_ENV=production
export DB_HOST=prod-db-host
export JWT_SECRET=super-secure-secret

# 启动应用
npm start
```

### 3. 健康检查
```bash
# 检查应用状态
curl http://localhost:3000/health

# 检查数据库连接
npm run check-env:prod
```

## 更多信息

- [Node.js 环境变量最佳实践](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [dotenv 文档](https://github.com/motdotla/dotenv)
- [Knex.js 配置文档](https://knexjs.org/guide/)