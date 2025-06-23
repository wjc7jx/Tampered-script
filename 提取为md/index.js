const ArticleContentExtractor = require('./extract-article-content');
const HtmlToMarkdownConverter = require('./convert-to-markdown');
const path = require('path');

class MainProcessor {
    constructor() {
        this.extractor = new ArticleContentExtractor();
        this.converter = new HtmlToMarkdownConverter();
    }

    /**
     * 运行完整的处理流程
     */
    async runFullProcess() {
        console.log('🚀 开始HTML文章处理流程...\n');
        
        const startTime = Date.now();
        
        try {
            // 第一步：提取article-content
            console.log('📋 步骤 1: 提取article-content部分');
            console.log('='.repeat(50));
            const extractSuccess = this.extractor.extractAll();
            
            if (!extractSuccess) {
                console.error('❌ 提取article-content失败，流程终止');
                return false;
            }
            
            console.log('\n✅ 步骤 1 完成\n');
            
            // 第二步：转换为Markdown
            console.log('📝 步骤 2: 转换HTML为Markdown');
            console.log('='.repeat(50));
            const convertSuccess = this.converter.convertAll();
            
            if (!convertSuccess) {
                console.error('❌ HTML到Markdown转换失败');
                return false;
            }
            
            console.log('\n✅ 步骤 2 完成\n');
            
            // 计算总耗时
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log('🎉 所有处理完成！');
            console.log('='.repeat(50));
            console.log(`⏱️  总耗时: ${duration} 秒`);
            console.log(`📁 输入目录: ${path.join(__dirname, 'row-html')}`);
            console.log(`📁 中间目录: ${path.join(__dirname, 'needConvert')}`);
            console.log(`📁 输出目录: ${path.join(__dirname, 'convered2md')}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ 处理过程中发生错误:', error.message);
            return false;
        }
    }

    /**
     * 仅运行提取article-content功能
     */
    async runExtractOnly() {
        console.log('📋 仅执行提取article-content功能\n');
        return this.extractor.extractAll();
    }

    /**
     * 仅运行HTML到Markdown转换功能
     */
    async runConvertOnly() {
        console.log('📝 仅执行HTML到Markdown转换功能\n');
        return this.converter.convertAll();
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log('HTML文章处理工具');
        console.log('='.repeat(50));
        console.log('用法: node index.js [选项]');
        console.log('');
        console.log('选项:');
        console.log('  --extract-only    仅提取article-content部分');
        console.log('  --convert-only    仅转换HTML为Markdown');
        console.log('  --help           显示此帮助信息');
        console.log('  (无参数)          运行完整流程');
        console.log('');
        console.log('目录结构:');
        console.log('  row-html/        输入HTML文件目录');
        console.log('  needConvert/     提取后的HTML文件目录');
        console.log('  convered2md/     最终的Markdown文件目录');
        console.log('');
        console.log('示例:');
        console.log('  node index.js                 # 运行完整流程');
        console.log('  node index.js --extract-only  # 仅提取内容');
        console.log('  node index.js --convert-only  # 仅转换格式');
    }
}

// 主函数
async function main() {
    const processor = new MainProcessor();
    const args = process.argv.slice(2);
    
    // 解析命令行参数
    if (args.includes('--help') || args.includes('-h')) {
        processor.showHelp();
        return;
    }
    
    if (args.includes('--extract-only')) {
        await processor.runExtractOnly();
        return;
    }
    
    if (args.includes('--convert-only')) {
        await processor.runConvertOnly();
        return;
    }
    
    // 默认运行完整流程
    await processor.runFullProcess();
}

// 如果直接运行此文件
if (require.main === module) {
    main().catch(error => {
        console.error('程序执行出错:', error.message);
        process.exit(1);
    });
}

module.exports = MainProcessor; 