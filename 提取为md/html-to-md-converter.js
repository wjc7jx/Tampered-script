const fs = require('fs');
const path = require('path');

/**
 * HTML转Markdown转换器
 * 支持转换：标题、段落、加粗、行内代码、代码块、图片、列表等
 */
class HtmlToMarkdownConverter {
    constructor() {
        this.rules = [
            // 标题转换 h1-h6
            { regex: /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, replacement: (match, level, content) => `${'#'.repeat(parseInt(level))} ${this.cleanText(content)}\n\n` },
            
            // 段落转换
            { regex: /<p[^>]*>(.*?)<\/p>/gi, replacement: (match, content) => `${this.cleanText(content)}\n\n` },
            
            // 加粗文本 <strong> 和 <b>
            { regex: /<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, replacement: (match, content) => `**${this.cleanText(content)}**` },
            
            // 斜体文本 <em> 和 <i>
            { regex: /<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, replacement: (match, content) => `*${this.cleanText(content)}*` },
            
            // 行内代码
            { regex: /<code[^>]*>(.*?)<\/code>/gi, replacement: (match, content) => `\`${this.cleanText(content)}\`` },
            
            // 代码块
            { regex: /<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, replacement: (match, content) => `\`\`\`\n${this.cleanText(content)}\n\`\`\`\n\n` },
            { regex: /<pre[^>]*>(.*?)<\/pre>/gis, replacement: (match, content) => `\`\`\`\n${this.cleanText(content)}\n\`\`\`\n\n` },
            
            // 图片
            { regex: /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, replacement: (match, src, alt) => `![${alt}](${src})\n\n` },
            { regex: /<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, replacement: (match, alt, src) => `![${alt}](${src})\n\n` },
            { regex: /<img[^>]*src=["']([^"']*)["'][^>]*>/gi, replacement: (match, src) => `![](${src})\n\n` },
            
            // 无序列表
            { regex: /<ul[^>]*>(.*?)<\/ul>/gis, replacement: (match, content) => this.convertList(content, false) },
            
            // 有序列表
            { regex: /<ol[^>]*>(.*?)<\/ol>/gis, replacement: (match, content) => this.convertList(content, true) },
            
            // 列表项
            { regex: /<li[^>]*>(.*?)<\/li>/gi, replacement: (match, content) => this.cleanText(content) },
            
            // 链接
            { regex: /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, replacement: (match, href, text) => `[${this.cleanText(text)}](${href})` },
            
            // 换行
            { regex: /<br\s*\/?>/gi, replacement: '\n' },
            
            // 水平线
            { regex: /<hr\s*\/?>/gi, replacement: '\n---\n\n' },
            
            // 移除样式标签
            { regex: /<style[^>]*>.*?<\/style>/gis, replacement: '' },
            
            // 移除脚本标签
            { regex: /<script[^>]*>.*?<\/script>/gis, replacement: '' },
            
            // 移除其他HTML标签
            { regex: /<[^>]+>/g, replacement: '' }
        ];
    }

    /**
     * 转换列表
     */
    convertList(content, isOrdered = false) {
        const items = content.match(/<li[^>]*>.*?<\/li>/gi) || []; // 获取列表项（匹配要求：<li>标签）
        let result = '';
        
        items.forEach((item, index) => {
            const cleanItem = item.replace(/<\/?li[^>]*>/gi, '').trim();
            const prefix = isOrdered ? `${index + 1}. ` : '- ';
            result += `${prefix}${this.cleanText(cleanItem)}\n`;
        });
        
        return result + '\n';
    }

    /**
     * 清理文本，移除多余的空白字符
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')  // 多个空白字符合并为一个空格
            .replace(/&nbsp;/g, ' ')  // 替换非断空格
            .replace(/&lt;/g, '<')    // HTML实体转换
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }

    /**
     * 转换HTML为Markdown
     */
    convert(html) {
        let markdown = html;
        
        // 应用所有转换规则
        this.rules.forEach(rule => {
            if (typeof rule.replacement === 'function') {
                markdown = markdown.replace(rule.regex, rule.replacement);
            } else {
                markdown = markdown.replace(rule.regex, rule.replacement);
            }
        });
        
        // 清理多余的空行
        markdown = markdown
            .replace(/\n{3,}/g, '\n\n')  // 多个换行合并为两个
            .trim();
        
        return markdown;
    }

    /**
     * 转换文件
     */
    convertFile(inputPath, outputPath) {
        try {
            // 读取HTML文件
            const htmlContent = fs.readFileSync(inputPath, 'utf8');
            
            // 转换为Markdown
            const markdownContent = this.convert(htmlContent);
            
            // 写入Markdown文件
            fs.writeFileSync(outputPath, markdownContent, 'utf8');
            
            console.log(`转换完成！`);
            console.log(`输入文件: ${inputPath}`);
            console.log(`输出文件: ${outputPath}`);
            console.log(`内容预览:\n${markdownContent.substring(0, 200)}...`);
            
        } catch (error) {
            console.error('转换失败:', error.message);
        }
    }
}

// 使用示例
function main() {
    const converter = new HtmlToMarkdownConverter();
    
    // 设置输入和输出文件路径
    const inputFile = path.join(__dirname, '1.html'); //输入
    const outputFile = path.join(__dirname, '1.md');
    
    // 检查输入文件是否存在
    if (!fs.existsSync(inputFile)) {
        console.error(`输入文件不存在: ${inputFile}`);
        return;
    }
    
    // 执行转换
    converter.convertFile(inputFile, outputFile);
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = HtmlToMarkdownConverter; 