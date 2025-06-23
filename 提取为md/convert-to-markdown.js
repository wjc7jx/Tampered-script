const fs = require('fs');
const path = require('path');

class HtmlToMarkdownConverter {
    constructor() {
        this.needConvertDir = path.join(__dirname, 'needConvert');
        this.converted2mdDir = path.join(__dirname, 'convered2md');
    }

    /**
     * 确保目录存在
     */
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`创建目录: ${dirPath}`);
        }
    }

    /**
     * 清理HTML标签，保留文本内容
     */
    stripHtmlTags(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
     * 清理HTML实体
     */
    decodeHtmlEntities(text) {
        const entities = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
            '&nbsp;': ' ',
            '&ldquo;': '"',
            '&rdquo;': '"',
            '&lsquo;': "'",
            '&rsquo;': "'",
            '&mdash;': '-',
            '&ndash;': '-'
        };
        
        return text.replace(/&[a-z0-9#]+;/gi, (match) => {
            return entities[match] || match;
        });
    }

    /**
     * 转换标题
     */
    convertHeadings(content) {
        // H1-H6 标题转换
        content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (match, text) => {
            return `\n# ${this.stripHtmlTags(text).trim()}\n\n`;
        });
        content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, text) => {
            return `\n## ${this.stripHtmlTags(text).trim()}\n\n`;
        });
        content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (match, text) => {
            return `\n### ${this.stripHtmlTags(text).trim()}\n\n`;
        });
        content = content.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (match, text) => {
            return `\n#### ${this.stripHtmlTags(text).trim()}\n\n`;
        });
        content = content.replace(/<h5[^>]*>(.*?)<\/h5>/gi, (match, text) => {
            return `\n##### ${this.stripHtmlTags(text).trim()}\n\n`;
        });
        content = content.replace(/<h6[^>]*>(.*?)<\/h6>/gi, (match, text) => {
            return `\n###### ${this.stripHtmlTags(text).trim()}\n\n`;
        });
        
        return content;
    }

    /**
     * 转换段落
     */
    convertParagraphs(content) {
        return content.replace(/<p[^>]*>(.*?)<\/p>/gi, (match, text) => {
            const cleanText = this.stripHtmlTags(text).trim();
            return cleanText ? `${cleanText}\n\n` : '';
        });
    }

    /**
     * 转换文本格式
     */
    convertTextFormatting(content) {
        // 加粗 (strong, b)
        content = content.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, (match, tag, text) => {
            return `**${this.stripHtmlTags(text)}**`;
        });
        
        // 斜体 (em, i)
        content = content.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, (match, tag, text) => {
            return `*${this.stripHtmlTags(text)}*`;
        });
        
        // 行内代码
        content = content.replace(/<code[^>]*>(.*?)<\/code>/gi, (match, text) => {
            return `\`${this.stripHtmlTags(text)}\``;
        });
        
        return content;
    }

    /**
     * 转换代码块
     */
    convertCodeBlocks(content) {
        return content.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, (match, code) => {
            const cleanCode = this.stripHtmlTags(code)
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
            return `\n\`\`\`\n${cleanCode}\n\`\`\`\n\n`;
        });
    }

    /**
     * 转换图片
     */
    convertImages(content) {
        return content.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, (match, src, alt) => {
            return `![${alt || '图片'}](${src})`;
        });
        
        // 处理没有alt属性的图片
        return content.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, (match, src) => {
            return `![图片](${src})`;
        });
    }

    /**
     * 转换链接
     */
    convertLinks(content) {
        return content.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
            const linkText = this.stripHtmlTags(text).trim();
            return `[${linkText}](${href})`;
        });
    }

    /**
     * 转换列表
     */
    convertList(content, isOrdered = false) {
        const items = content.match(/<li[^>]*>.*?<\/li>/gi) || []; // 获取列表项（匹配要求：<li>标签）
        let result = '';
        
        items.forEach((item, index) => {
            const text = this.stripHtmlTags(item).trim();
            if (text) {
                if (isOrdered) {
                    result += `${index + 1}. ${text}\n`;
                } else {
                    result += `- ${text}\n`;
                }
            }
        });
        
        return result + '\n';
    }

    /**
     * 转换所有列表
     */
    convertLists(content) {
        // 有序列表
        content = content.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, listContent) => {
            return '\n' + this.convertList(listContent, true);
        });
        
        // 无序列表
        content = content.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, listContent) => {
            return '\n' + this.convertList(listContent, false);
        });
        
        return content;
    }

    /**
     * 移除不需要的标签
     */
    removeUnwantedTags(content) {
        // 移除样式、脚本等标签及其内容
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
        
        // 移除其他HTML标签
        content = content.replace(/<[^>]+>/g, '');
        
        return content;
    }

    /**
     * 清理多余空白和换行
     */
    cleanWhitespace(content) {
        // 移除多余的空行
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // 移除行首行尾空白
        content = content.split('\n').map(line => line.trim()).join('\n');
        
        // 移除开头和结尾的空行
        content = content.trim();
        
        return content;
    }

    /**
     * 将HTML转换为Markdown
     */
    convertHtmlToMarkdown(htmlContent) {
        try {
            let content = htmlContent;
            
            // 按顺序进行转换
            content = this.convertHeadings(content);
            content = this.convertCodeBlocks(content);
            content = this.convertTextFormatting(content);
            content = this.convertImages(content);
            content = this.convertLinks(content);
            content = this.convertLists(content);
            content = this.convertParagraphs(content);
            content = this.removeUnwantedTags(content);
            content = this.decodeHtmlEntities(content);
            content = this.cleanWhitespace(content);
            
            return content;
        } catch (error) {
            console.error('转换HTML到Markdown时出错:', error.message);
            return null;
        }
    }

    /**
     * 处理单个HTML文件
     */
    processHtmlFile(filename) {
        const inputPath = path.join(this.needConvertDir, filename);
        // 文件名已经在extract阶段清理过了，这里直接转换扩展名
        const outputFilename = filename.replace(/\.html?$/i, '.md');
        const outputPath = path.join(this.converted2mdDir, outputFilename);

        try {
            console.log(`正在转换文件: ${filename}`);
            console.log(`输出文件: ${outputFilename}`);
            
            // 读取HTML文件
            const htmlContent = fs.readFileSync(inputPath, 'utf8');
            
            // 转换为Markdown
            const markdownContent = this.convertHtmlToMarkdown(htmlContent);
            
            if (markdownContent) {
                // 保存Markdown文件
                fs.writeFileSync(outputPath, markdownContent, 'utf8');
                console.log(`✅ 成功转换并保存: ${outputPath}`);
                return true;
            } else {
                console.log(`❌ 转换文件 ${filename} 失败`);
                return false;
            }
        } catch (error) {
            console.error(`处理文件 ${filename} 时出错:`, error.message);
            return false;
        }
    }

    /**
     * 主要的转换方法
     */
    convertAll() {
        console.log('=== 开始HTML到Markdown转换 ===');
        
        // 确保目录存在
        this.ensureDirectoryExists(this.converted2mdDir);
        
        // 检查needConvert目录是否存在
        if (!fs.existsSync(this.needConvertDir)) {
            console.error(`错误: needConvert目录不存在: ${this.needConvertDir}`);
            return false;
        }

        // 获取所有HTML文件
        const files = fs.readdirSync(this.needConvertDir);
        const htmlFiles = files.filter(file => file.toLowerCase().endsWith('.html'));

        if (htmlFiles.length === 0) {
            console.log('needConvert目录中没有找到HTML文件');
            return false;
        }

        console.log(`找到 ${htmlFiles.length} 个HTML文件`);

        let successCount = 0;
        let failCount = 0;

        // 处理每个HTML文件
        htmlFiles.forEach(filename => {
            if (this.processHtmlFile(filename)) {
                successCount++;
            } else {
                failCount++;
            }
        });

        console.log('\n=== 转换完成 ===');
        console.log(`成功: ${successCount} 个文件`);
        console.log(`失败: ${failCount} 个文件`);
        console.log(`输出目录: ${this.converted2mdDir}`);

        return successCount > 0;
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const converter = new HtmlToMarkdownConverter();
    converter.convertAll();
}

module.exports = HtmlToMarkdownConverter; 