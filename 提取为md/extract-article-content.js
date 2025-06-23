const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class ArticleContentExtractor {
    constructor() {
        this.rowHtmlDir = path.join(__dirname, 'row-html');
        this.needConvertDir = path.join(__dirname, 'needConvert');
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
     * 获取清理后的文件名，移除【】包裹的内容
     */
    getCleanFileName(originalFileName) {
        // 移除【】包裹的内容
        return originalFileName.replace(/【[^】]*】/g, '');
    }

    /**
     * 从文件名获取标题（移除扩展名和【】内容）
     */
    getTitleFromFileName(fileName) {
        return fileName.replace('.html', '').replace(/【[^】]*】/g, '');
    }

    /**
     * 提取article-content部分的HTML
     */
    extractArticleContent(htmlContent, title = '提取的文章内容') {
        try {
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;
            
            // 查找class为article-content的元素
            const articleContent = document.querySelector('.article-content');
            
            if (!articleContent) {
                console.log('未找到class为article-content的元素');
                return null;
            }

            // 获取内联样式
            const styles = document.querySelectorAll('style');
            let styleContent = '';
            styles.forEach(style => {
                styleContent += style.innerHTML + '\n';
            });

            // 构建完整的HTML结构，保留样式
            const extractedHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* 保留原有样式 */
        ${styleContent}
        
        /* 额外的基础样式 */
        .article-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .article-content h1, .article-content h2, .article-content h3, 
        .article-content h4, .article-content h5, .article-content h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
        }
        
        .article-content p {
            margin-bottom: 1em;
        }
        
        .article-content code {
            background-color: #f6f8fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        
        .article-content pre {
            background-color: #f6f8fa;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1em 0;
        }
        
        .article-content img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
        }
        
        .article-content ul, .article-content ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        
        .article-content li {
            margin-bottom: 0.5em;
        }
    </style>
</head>
<body>
    ${articleContent.outerHTML}
</body>
</html>`;

            return extractedHtml;
        } catch (error) {
            console.error('提取article-content时出错:', error.message);
            return null;
        }
    }

    /**
     * 处理单个HTML文件
     */
    processHtmlFile(filename) {
        const inputPath = path.join(this.rowHtmlDir, filename);
        
        // 获取清理后的文件名
        const cleanFileName = this.getCleanFileName(filename);
        const outputPath = path.join(this.needConvertDir, cleanFileName);
        
        // 获取标题
        const title = this.getTitleFromFileName(filename);

        try {
            console.log(`正在处理文件: ${filename}`);
            console.log(`输出文件名: ${cleanFileName}`);
            console.log(`文章标题: ${title}`);
            
            // 读取HTML文件
            const htmlContent = fs.readFileSync(inputPath, 'utf8');
            
            // 提取article-content，传入标题
            const extractedHtml = this.extractArticleContent(htmlContent, title);
            
            if (extractedHtml) {
                // 保存提取的内容
                fs.writeFileSync(outputPath, extractedHtml, 'utf8');
                console.log(`✅ 成功提取并保存: ${outputPath}`);
                return true;
            } else {
                console.log(`❌ 文件 ${filename} 中未找到article-content内容`);
                return false;
            }
        } catch (error) {
            console.error(`处理文件 ${filename} 时出错:`, error.message);
            return false;
        }
    }

    /**
     * 主要的提取方法
     */
    extractAll() {
        console.log('=== 开始提取article-content ===');
        
        // 确保目录存在
        this.ensureDirectoryExists(this.needConvertDir);
        
        // 检查row-html目录是否存在
        if (!fs.existsSync(this.rowHtmlDir)) {
            console.error(`错误: row-html目录不存在: ${this.rowHtmlDir}`);
            return false;
        }

        // 获取所有HTML文件
        const files = fs.readdirSync(this.rowHtmlDir);
        const htmlFiles = files.filter(file => file.toLowerCase().endsWith('.html'));

        if (htmlFiles.length === 0) {
            console.log('row-html目录中没有找到HTML文件');
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

        console.log('\n=== 提取完成 ===');
        console.log(`成功: ${successCount} 个文件`);
        console.log(`失败: ${failCount} 个文件`);
        console.log(`输出目录: ${this.needConvertDir}`);

        return successCount > 0;
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const extractor = new ArticleContentExtractor();
    extractor.extractAll();
}

module.exports = ArticleContentExtractor; 