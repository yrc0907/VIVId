/**
 * 认证相关类型定义
 */

/**
 * 用户数据结构
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

/**
 * 登录表单数据
 */
export interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * 注册表单数据
 */
export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
} 