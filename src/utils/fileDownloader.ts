/**
 * 触发浏览器下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param mimeType MIME类型
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') {
    console.warn('`downloadFile` is only available in the browser.');
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
} 