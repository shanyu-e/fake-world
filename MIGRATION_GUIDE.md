# 数据源迁移指南

## 概述

本项目已成功从纯本地存储（localStorage）迁移到支持多种数据源的架构，包括：
- **本地存储模式**: 使用 localStorage（原有方式）
- **远程数据库模式**: 使用 PostgreSQL + Prisma
- **混合模式**: 本地缓存 + 远程同步

## 架构变更

### 1. 数据访问层抽象

```
src/data/
├── types/IDataSource.ts          # 数据源接口定义
├── sources/
│   ├── LocalDataSource.ts        # 本地数据源
│   ├── RemoteDataSource.ts       # 远程数据源
│   └── HybridDataSource.ts       # 混合数据源
└── DataSourceFactory.ts          # 数据源工厂
```

### 2. 状态管理升级

```
src/stateV2/
├── atomWithStorage.ts            # 原有本地存储atom
├── atomWithDataSource.ts         # 新的数据源atom
├── wallet.ts                     # 原有钱包状态
└── walletV2.ts                   # 新的钱包状态（支持数据源）
```

### 3. API 服务扩展

```
packages/api/src/
├── db/index.ts                   # Prisma 数据库连接
├── routes/
│   ├── profiles.ts              # 用户档案API
│   ├── wallet.ts                # 钱包API
│   ├── dialogues.ts             # 对话API
│   └── conversations.ts         # 聊天记录API
└── index.ts                     # 主API服务
```

## 使用方法

### 1. 环境配置

创建 `.env.local` 文件：

```bash
# API 配置
VITE_API_URL=http://localhost:9000

# 数据源配置
VITE_DATA_SOURCE_MODE=local  # local | remote | hybrid
VITE_SYNC_INTERVAL=30000
VITE_SYNC_ON_READ=true
VITE_SYNC_ON_WRITE=true
VITE_OFFLINE_MODE=false
```

### 2. 数据源切换

```typescript
import { useDataSourceConfig } from '@/hooks/useDataSourceConfig';

const { config, setMode } = useDataSourceConfig();

// 切换到远程模式
setMode('remote');

// 切换到混合模式
setMode('hybrid');
```

### 3. 使用新的状态管理

```typescript
import { 
  walletAtom, 
  walletLoadingAtom, 
  walletErrorAtom,
  loadWallet,
  updateWallet 
} from '@/stateV2/walletV2';

// 在组件中使用
const [wallet] = useAtom(walletAtom);
const [loading] = useAtom(walletLoadingAtom);
const [error] = useAtom(walletErrorAtom);

// 更新钱包数据
updateWallet({ balance: '1000.00' });

// 重新加载数据
loadWallet();
```

## 迁移步骤

### 阶段1: 基础设施 ✅
- [x] 安装 Prisma 和相关依赖
- [x] 配置 PostgreSQL 数据库
- [x] 创建数据库 Schema
- [x] 实现 API 路由

### 阶段2: 数据源抽象 ✅
- [x] 创建数据源接口
- [x] 实现本地数据源
- [x] 实现远程数据源
- [x] 实现混合数据源
- [x] 创建数据源工厂

### 阶段3: 状态管理升级 ✅
- [x] 创建新的 atom 工厂
- [x] 实现钱包状态迁移
- [x] 创建数据源切换组件
- [x] 创建测试页面

### 阶段4: 渐进式迁移（进行中）
- [ ] 迁移用户档案状态
- [ ] 迁移对话列表状态
- [ ] 迁移聊天记录状态
- [ ] 迁移朋友圈状态
- [ ] 迁移交易记录状态

### 阶段5: 优化和测试
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 单元测试
- [ ] 集成测试

## 测试

访问测试页面验证功能：
```
http://localhost:5173/data-source-test
```

## 注意事项

1. **向后兼容**: 原有的 `atomWithStorage` 仍然可用
2. **渐进迁移**: 可以逐步迁移各个模块
3. **离线支持**: 混合模式支持离线使用
4. **错误处理**: 完善的错误处理和回退机制
5. **性能优化**: 本地缓存减少网络请求

## 下一步

1. 完成所有状态管理的迁移
2. 添加数据同步策略
3. 实现冲突解决机制
4. 添加数据备份和恢复功能
5. 性能监控和优化
