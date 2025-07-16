自用登录模版，技术栈 nextjs，react，authjs，shadecn
![image](https://github.com/user-attachments/assets/2333f9a6-ff06-4fd4-8fe4-764ebd1a7b79)

## AI PPT 大纲生成器

### 配置 Deepseek AI API

该项目使用 Deepseek AI API 生成 PPT 大纲。请按照以下步骤配置：

1. 在根目录创建`.env.local`文件
2. 添加以下环境变量：

```
# Deepseek API配置
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

3. 将`your_api_key_here`替换为您的实际 API 密钥

如果未配置 API 密钥，系统将使用备用模板生成大纲。

### 开发说明

要启动开发服务器，请运行：

```bash
pnpm dev
```

项目将在 [http://localhost:3000](http://localhost:3000) 上运行。
