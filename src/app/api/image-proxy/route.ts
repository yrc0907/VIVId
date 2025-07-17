import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// 使用 App Router 格式的 API 处理函数
export async function POST(request: Request) {
  try {
    // 从环境变量获取 API key
    const apiKey = process.env.NEXT_PUBLIC_DOUBAO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置API密钥' },
        { status: 500 }
      );
    }

    // 解析请求体
    const { prompt, size } = await request.json();

    // 使用火山引擎官方文档中的API端点和模型
    const apiUrl = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
    const modelId = 'doubao-seedream-3-0-t2i-250415';

    console.log('请求API:', prompt);
    console.log('使用模型:', modelId);
    console.log('API端点:', apiUrl);

    // 按照官方文档构建请求体
    const requestBody = {
      model: modelId,
      prompt,
      size: size || '1024x1024',
      response_format: 'url'
    };

    console.log('请求体:', JSON.stringify(requestBody));

    const response = await axios.post(
      apiUrl,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000 // 60秒超时
      }
    );

    console.log('API响应成功');

    // 直接返回官方API响应
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('代理请求失败:', error);

    // 错误处理
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    let responseData = undefined;

    // 处理Axios错误
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      responseData = axiosError.response?.data;
      console.error('API响应详情:', responseData);
    }

    return NextResponse.json(
      {
        error: '代理请求失败',
        message: errorMessage,
        response: responseData
      },
      { status: 500 }
    );
  }
} 