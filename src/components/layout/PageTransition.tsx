"use client";

import { motion } from "framer-motion";
import { PageTransitionProps } from "@/types/layout.types";

/**
 * 页面过渡动画组件
 * 
 * @param children 子组件
 * @param type 过渡类型：淡入淡出(fade)、滑动(slide)、缩放(scale)或无(none)
 * @param duration 过渡持续时间(秒)
 */
export const PageTransition = ({
  children,
  type = "fade",
  duration = 0.5
}: PageTransitionProps) => {
  // 如果设置为无动画，直接返回子组件
  if (type === "none") return <>{children}</>;

  // 不同类型的过渡动画配置
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    }
  };

  // 获取动画配置
  const animation = animations[type] || animations.fade;

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ duration }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}; 