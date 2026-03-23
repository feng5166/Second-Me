# Second Me 本地部署指南

> 基于 2026-03-23 在 Mac mini (M4, 48GB RAM) 上的实际部署经验整理

## 📋 环境要求

| 项目 | 要求 | 备注 |
|------|------|------|
| 操作系统 | macOS / Linux | 本文档基于 macOS ARM64 |
| 内存 | 8GB+，推荐 16GB+ | 训练时内存占用约 25GB |
| Python | 3.12 | 必须 |
| Node.js | 23+ | 前端依赖 |
| CMake | 4.0+ | 编译 llama.cpp 需要 |

## 🚀 快速部署

### 方式一：本地 Poetry 部署（推荐）

Docker 方式在国内网络环境下拉取镜像较慢，推荐使用本地部署。

```bash
# 1. 克隆仓库
git clone https://github.com/mindverse/Second-Me.git
cd Second-Me

# 2. 安装依赖
brew install cmake  # macOS，Linux 用对应包管理器

# 3. 复制环境变量文件
cp .env.example .env

# 4. 运行安装脚本
make setup
# 这会自动：
# - 安装 Poetry 和 Python 依赖
# - 编译 llama.cpp（约 5 分钟）
# - 安装前端 npm 依赖

# 5. 启动服务
make start
```

### 方式二：Docker 部署

如果网络环境良好，可以使用 Docker：

```bash
# 1. 克隆仓库
git clone https://github.com/mindverse/Second-Me.git
cd Second-Me

# 2. 启动容器
make docker-up
# 根据提示选择 CUDA 或 CPU 模式（Mac 选 n）
```

## ⚠️ macOS 常见问题

### 问题 1：sed 命令报错

**报错**：`sed: 1: ".env\n": invalid command code .`

**原因**：macOS 的 `sed -i` 语法与 Linux 不同

**解决方案**：修改 `scripts/prompt_cuda.sh`，将所有 `sed -i` 改为 `sed -i ''`

```bash
# 修改前
sed -i 's/xxx/yyy/' .env

# 修改后
sed -i '' 's/xxx/yyy/' .env
```

### 问题 2：Docker 镜像拉取超时

**原因**：国内网络访问 Docker Hub 较慢

**解决方案**：
1. 配置 Docker 镜像加速器
2. 或改用本地 Poetry 部署（推荐）

### 问题 3：llama.cpp 编译失败

**解决方案**：确保安装了 CMake

```bash
brew install cmake
```

## 🔧 配置 Support Model

训练需要配置外部 LLM 进行数据合成：

1. 打开 http://localhost:3000
2. 进入 Training 页面
3. 点击 "Configure Support Model"
4. 选择 "Custom" 并填入：

| 字段 | 示例值 |
|------|--------|
| Chat Model | claude-3-5-sonnet-20241022 |
| API Key | sk-xxx |
| API Endpoint | https://api.openai.com/v1 |
| Embedding Model | text-embedding-3-small |
| Embedding API Key | sk-xxx |
| Embedding Endpoint | https://api.openai.com/v1 |

> 也支持 OpenAI 兼容的第三方 API

## 📝 使用流程

### 1. 创建身份

- 访问 http://localhost:3000
- 填写 Name、Description、Email

### 2. 上传记忆

- 至少上传 **3 条** 记忆才能开始训练
- 支持：文本、文件、文件夹

### 3. 训练模型

- 配置 Support Model（用于数据合成）
- 选择 Base Model（默认 Qwen2.5-0.5B）
- 点击 "Start Training"
- 训练时间：约 10-20 分钟（取决于数据量）

### 4. 对话测试

- 点击顶部 "Start Service"
- 进入 Playground → Chat Mode
- 开始对话

## 📊 训练阶段说明

| 阶段 | 说明 | 耗时估计 |
|------|------|---------|
| Model Download | 下载 Qwen 基础模型 (~942MB) | 2-5 分钟 |
| Activating Memory Matrix | 文档向量化 | 1 分钟 |
| Synthesize Life Narrative | 生成用户画像 | 3-5 分钟 |
| Prepare Training Data | 生成训练 QA | 2-3 分钟 |
| Training | LoRA 微调 | 1-2 分钟 |
| Merge & Convert | 合并权重、转 GGUF | 1 分钟 |

## 🗂️ 目录结构

```
second-me/
├── lpm_frontend/          # 前端 (Next.js)
├── lpm_kernel/            # 后端 (Python)
├── llama.cpp/             # 本地推理引擎
├── resources/
│   ├── L1/                # 记忆处理数据
│   ├── L2/                # 训练数据
│   │   └── base_models/   # 下载的基础模型
│   └── model/
│       └── output/        # 训练输出
│           ├── personal_model/  # LoRA 权重
│           ├── merged_model/    # 合并后模型
│           └── gguf/            # GGUF 格式模型
├── logs/                  # 日志
└── data/                  # 用户数据
```

## 🔄 常用命令

```bash
# 启动服务
make start

# 停止服务
# Ctrl+C 或关闭终端

# 重新训练（清理旧数据）
rm -rf resources/L1 resources/L2/data resources/model/output
# 然后在 Web UI 重新上传记忆并训练

# 查看后端日志
tail -f logs/backend.log

# 查看训练日志
tail -f logs/train/train.log
```

## 💡 效果优化建议

1. **上传更多记忆**：3 条是最低要求，建议 10+ 条
2. **记忆内容丰富**：包含个人经历、偏好、专业知识
3. **使用更大模型**：如果内存足够，可选 7B 模型
4. **提高 Data Synthesis Mode**：Medium 或 High

## 📚 参考资料

- GitHub: https://github.com/mindverse/Second-Me
- 官方文档: https://secondme.gitbook.io/secondme/
- FAQ: https://secondme.gitbook.io/secondme/faq

---

*部署时间：2026-03-23 | 部署环境：Mac mini M4 48GB | 部署方式：本地 Poetry*
