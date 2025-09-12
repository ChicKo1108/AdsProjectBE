# 广告数据平台后端

## 接口文档

### 用户端

#### 登录
- url: /api/login
- method: POST
- params:
  - username: string
  - password: string
- response:
  - token: string

#### 首页信息接口
获取账户信息，时间倒序前五条广告计划，时间倒序前五条广告创意
- url: /api/home
- method: GET
- response:
  - account: object
    - name: number
    - balance: number
    - today_cost: number
    - account_daily_budget: number
  - ad_plans: array
    - id: number
    - name: string
    - plan_type: string
    - target: number
    - price_stratagy: number
    - placement_type: string
    - status: number
    - chuang_yi_you_xuan: number
    - budget: number
    - cost: number
    - display_count: number
    - click_count: number
    - download_count: number
    - click_per_price: number
    - click_rate: number
    - ecpm: number
    - download_per_count: number
    - download_rate: number
    - start_date: Date
    - end_date: Date
    - status: number
  - ad_creatives: array
    - id: number
    - name: string
    - display_id: string
    - status: number(0, 1) // 开关
    - budget: number // 计划日预算
    - download_cost: number // 下载成本
    - click_cost: number // 点击成本
    - costs: number // 消耗金额
    - download_count: number // 下载量
    - download_rate: number // 下载率
    - ecpm: number // ECPM
    - display_count: number // 曝光量
    - click_count: number // 点击量
    - click_rate: number // 点击率

#### 获取广告计划列表
- url: /api/ad_plans
- method: GET
- params:
  - page: number
  - pageSize: number
  - name: string
  - status: number
- response:
  - ad_plans: array
    - id: number
    - name: string
    - plan_type: string
    - target: number
    - price_stratagy: number
    - placement_type: string
    - status: number
    - chuang_yi_you_xuan: number
    - budget: number
    - cost: number
    - display_count: number
    - click_count: number
    - download_count: number
    - click_per_price: number
    - click_rate: number
    - ecpm: number
    - download_per_count: number
    - download_rate: number
    - start_date: Date
    - end_date: Date
    - status: number

#### 获取广告计划详情
- url: /api/ad_plans/:id
- method: GET
- response:
  - ad_plan: object
    - id: number
    - name: string
    - plan_type: string
    - target: number
    - price_stratagy: number
    - placement_type: string
    - status: number
    - chuang_yi_you_xuan: number
    - budget: number
    - cost: number
    - display_count: number
    - click_count: number
    - download_count: number
    - click_per_price: number
    - click_rate: number
    - ecpm: number
    - download_per_count: number
    - download_rate: number
    - start_date: Date
    - end_date: Date
    - status: number

#### 获取广告组列表
- url: /api/ad_groups
- method: GET
- params:
  - page: number
  - pageSize: number
  - name: string
  - status: number
- response:
  - ad_groups: array
    - id: number
    - name: string
    - ad_plans: AdPlan[]

#### 获取广告创意列表
- url: /api/ad_creatives
- method: GET
- params:
  - page: number
  - pageSize: number
  - name: string
  - status: number
- response:
  - ad_creatives: array

#### 获取广告创意详情
- url: /api/ad_creatives/:id
- method: GET
- response:
  - ad_creative: object

### 管理员端

#### 创建用户
- url: /api/admin/users
- method: POST
- params:
  - username: string
  - name: string
  - password: string
  - role: string(super-admin | admin | user)
- response:
  - user: object

#### 修改用户
- url: /api/admin/users/:id
- method: PUT
- params:
  - name: string
  - password: string
  - role: string(super-admin | admin | user)
- response:
  - user: object

#### 新建广告计划
- url: /api/admin/ad_plans
- method: POST
- params:
  - name: string
  - plan_type: string
  - target: number
  - price_stratagy: number
  - placement_type: string
  - status: number
  - chuang_yi_you_xuan: number
  - budget: number
  - cost: number
  - display_count: number
  - click_count: number
  - download_count: number
  - click_per_price: number
  - click_rate: number
  - ecpm: number
  - download_per_count: number
  - download_rate: number
  - start_date: Date
  - end_date: Date
  - status: number
- response:
  - ad_plan: object

#### 修改广告计划
- url: /api/admin/ad_plans/:id
- method: PUT
- params:
  - name: string
  - plan_type: string
  - target: number
  - price_stratagy: number
  - placement_type: string
  - status: number
  - chuang_yi_you_xuan: number
  - budget: number
  - cost: number
  - display_count: number
  - click_count: number
  - download_count: number
  - click_per_price: number
  - click_rate: number
  - ecpm: number
  - download_per_count: number
  - download_rate: number
  - start_date: Date
  - end_date: Date
  - status: number
- response:
  - ad_plan: object

#### 删除广告计划
- url: /api/admin/ad_plans/:id
- method: DELETE
- response:
  - message: string

#### 绑定广告组
- url: /api/admin/ad_plans/:id/ad_groups
- auth: admin
- method: POST
- params:
  - ad_group_ids: number[]
- response:
  - ad_plan: object

#### 删除广告组
如果广告组中还有广告计划则不能删除
- url: /api/admin/ad_plans/:id/ad_groups
- method: DELETE
- response:
  - message: string

#### 创建广告创意
- url: /api/admin/ad_creatives
- method: POST
- params:
  - name: string
  - display_id: string
  - status: number(0, 1) // 开关
  - budget: number // 计划日预算
  - download_cost: number // 下载成本
  - click_cost: number // 点击成本
  - costs: number // 消耗金额
  - download_count: number // 下载量
  - download_rate: number // 下载率
  - ecpm: number // ECPM
  - display_count: number // 曝光量
  - click_count: number // 点击量
  - click_rate: number // 点击率
- response:
  - ad_creative: object

#### 修改广告创意
- url: /api/admin/ad_creatives/:id
- method: PUT
- params:
  - name: string
  - display_id: string
  - status: number(0, 1) // 开关
  - budget: number // 计划日预算
  - download_cost: number // 下载成本
  - click_cost: number // 点击成本
  - costs: number // 消耗金额
  - download_count: number // 下载量
  - download_rate: number // 下载率
  - ecpm: number // ECPM
  - display_count: number // 曝光量
  - click_count: number // 点击量
  - click_rate: number // 点击率
- response:
  - ad_creative: object

#### 删除广告创意
- url: /api/admin/ad_creatives/:id
- method: DELETE
- response:
  - message: string

#### 修改账户(Account)信息
- url: /api/admin/account
- method: PUT
- params:
  - balance: number
  - today_cost: number
  - account_daily_budget: number
- response:
  - account: object


## 数据表

#### User（用户表）
- id: number
- username: string
- name: string
- password: string
- role: string(super-admin | admin | user)
- ban: Boolean


#### AdPlan（广告计划表）
- id: number
- name: string // 计划名称
- plan_type: string // 计划类型
- target: number(0-应用推广, 1-网页推广, 2-快应用推广, 3-小程序推广, 4-应用下载) // 推广目标
- price_stratagy: number(0-稳定成本, 1-最大转化, 2-最优成本) // 竞价策略
- placement_type: string // 投放类型
- status: Number(0-草稿, 1-启用, 2-暂停, 3-结束)
- chuang_yi_you_xuan: number(0-未启动, 1-启动)
- budget: number // 预算
- cost: number // 花费
- display_count: number // 曝光量
- click_count: number // 点击量
- download_count: number // 下载量
- click_per_price: number // 点击均价
- click_rate: number // 点击率
- ecpm: number // ECPM
- download_per_count: number // 下载均价
- download_rate: number // 下载率
- start_date: Date
- end_date: Date
- status: number

#### AdCreatives

- id: number
- name: stirng
- display_id: string
- status: number(0, 1) // 开关
- budget: number // 计划日预算
- download_cost: number // 下载成本
- click_cost: number // 点击成本
- costs: number // 消耗金额
- download_count: number // 下载量
- download_rate: number // 下载率
- ecpm: number // ECPM
- display_count: number // 曝光量
- click_count: number // 点击量
- click_rate: number // 点击率

#### AdGroup

- id: number
- name: string

#### Account（账户）
balance: number // 余额
today_cost: number // 今日广告消耗
account_daily_budget: number // 账户日预算