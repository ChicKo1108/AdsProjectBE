# 广告数据平台后端

### 数据表

#### User（用户表）
- id: number
- username: string
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
- click_reate: number // 点击率

#### AdGroup

- id: number
- name: string