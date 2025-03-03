# CSDN笔记获取脚本需求

## 功能描述
开发一个油猴脚本，用于自动获取CSDN博客文章内容并转换为Markdown格式。

## 主要功能
1. 自动识别CSDN文章页面
2. 提取文章主要内容区域（XPath: //*[@id="mainBox"]/main/div[1]）
3. 将HTML内容转换为Markdown格式
4. 提供复制功能，方便用户获取转换后的内容

## 技术要求
1. 使用JavaScript/Tampermonkey API开发
2. 需要处理CSDN文章页面的特定DOM结构
3. 实现HTML到Markdown的转换功能
4. 添加用户界面元素（如复制按钮）

## 实现细节
1. 添加页面匹配规则：匹配CSDN博客文章页面
2. 使用DOM操作获取目标内容
3. 转换处理：
   - 处理标题（h1-h6）
   - 处理代码块
   - 处理图片
   - 处理链接
   - 处理列表
4. 添加用户交互界面
5. 实现复制功能

## 注意事项
1. 需要处理CSDN文章页面可能的结构变化
2. 确保转换后的Markdown格式正确
3. 考虑性能优化，避免影响页面加载速度