// ==UserScript==
// @name         CSDN Note Scraper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动获取CSDN笔记并转换为Markdown格式
// @author       Your Name
// @match        *://*.csdn.net/*
// @grant        none
// @require      https://unpkg.com/turndown@7.1.2/dist/turndown.js
// ==/UserScript==

(function() {
    'use strict';

    // 创建复制按钮
    const button = document.createElement('button');
    button.innerText = '复制CSDN笔记';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '8px 16px';
    button.style.backgroundColor = '#1E90FF';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    document.body.appendChild(button);

    button.onclick = function() {
        // 提取主要内容
        const content = document.evaluate('//*[@id="mainBox"]/main/div[1]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (content) {
            // 克隆内容以避免修改原始DOM
            const clonedContent = content.cloneNode(true);
            
            // 移除代码块下方的数字
            const preElements = clonedContent.getElementsByTagName('pre');
            for (let pre of preElements) {
                const nextElement = pre.nextElementSibling;
                if (nextElement && nextElement.tagName === 'UL') {
                    nextElement.remove();
                }
            }

            // 使用TurnDown转换为Markdown
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced'
            });

            // 添加代码块规则
            turndownService.addRule('fencedCodeBlock', {
                filter: function(node, options) {
                    return (
                        node.nodeName === 'PRE' &&
                        node.firstChild &&
                        node.firstChild.nodeName === 'CODE'
                    );
                },
                replacement: function(content, node, options) {
                    const language = node.firstChild.className || '';
                    const code = node.firstChild.textContent;
                    return '\n```' + language + '\n' + code + '\n```\n';
                }
            });

            // 转换为Markdown
            const markdown = turndownService.turndown(clonedContent);
            
            // 复制到剪贴板
            navigator.clipboard.writeText(markdown).then(() => {
                button.innerText = '复制成功！';
                setTimeout(() => {
                    button.innerText = '复制CSDN笔记';
                }, 2000);
            }).catch(() => {
                alert('复制失败，请检查浏览器权限！');
            });
        } else {
            alert('未找到CSDN笔记内容！');
        }
    };
})();
