// ==UserScript==
// @name         测试AI接口
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  测试AI接口是否正常工作
// @author       Your name
// @match        https://space.bilibili.com/*
// @grant        GM_xmlhttpRequest
// @connect      api.siliconflow.cn
// ==/UserScript==

(function() {
    'use strict';

    // 添加测试按钮
    const btn = document.createElement('button');
    btn.textContent = '测试AI接口';
    btn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 8px 16px;
        background: #ff6b6b;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    document.body.appendChild(btn);

    // AI配置
    const AI_CONFIG = {
        url: 'https://api.siliconflow.cn/v1/chat/completions',
        token: 'sk-nmhcrymaktgoupxtlfufbomowoohjsnfzrhkpbcejdjutgos',
        model: 'Qwen/Qwen2.5-7B-Instruct'
    };

    // 测试函数
    async function testAI() {
        const testPrompt = `
请分析以下视频是否适合放入这个��藏夹。请只回复一个0到1之间的数字，表示匹配度。

视频信息：
标题：计算机网络原理详解
描述：本课程详细讲解计算机网络基础知识
标签：教育, 计算机, 网络

收藏夹信息：
名称：计算机课程
描述：计算机相关的教学视频

只需返回一个数字，不要包含任何其他文字。`;

        console.log('开始测试AI接口...');
        console.log('发送的提示词:', testPrompt);

        try {
            const response = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: AI_CONFIG.url,
                    headers: {
                        'Authorization': `Bearer ${AI_CONFIG.token}`,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        model: AI_CONFIG.model,
                        messages: [{
                            role: 'user',
                            content: testPrompt
                        }],
                        stream: false,
                        max_tokens: 512,
                        temperature: 0.7,
                        top_p: 0.7
                    }),
                    responseType: 'json',
                    onload: function(response) {
                        console.log('收到响应:', response);
                        if (response.status === 200) {
                            resolve(response.response);
                        } else {
                            reject(new Error(`HTTP错误: ${response.status}`));
                        }
                    },
                    onerror: function(error) {
                        console.error('请求错误:', error);
                        reject(error);
                    }
                });
            });

            console.log('AI响应数据:', response);

            // 显示结果
            showResult({
                prompt: testPrompt,
                response: response,
                rawContent: response.choices?.[0]?.message?.content
            });

        } catch (err) {
            console.error('测试失败:', err);
            showResult({
                error: err.message
            });
        }
    }

    // 显示结果
    function showResult(data) {
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10001;
            max-width: 80%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        if (data.error) {
            resultDiv.innerHTML = `
                <h3 style="color: #ff4444;">测试失败</h3>
                <pre style="color: #ff4444;">${data.error}</pre>
                <button onclick="this.parentElement.remove()">关闭</button>
            `;
        } else {
            resultDiv.innerHTML = `
                <h3>测试结果</h3>
                <div style="margin: 10px 0;">
                    <h4>发送的提示词：</h4>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${data.prompt}</pre>
                </div>
                <div style="margin: 10px 0;">
                    <h4>AI响应内容：</h4>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${data.rawContent || '无内容'}</pre>
                </div>
                <div style="margin: 10px 0;">
                    <h4>完整响应数据：</h4>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${JSON.stringify(data.response, null, 2)}</pre>
                </div>
                <button onclick="this.parentElement.remove()" style="
                    margin-top: 10px;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">关闭</button>
            `;
        }

        document.body.appendChild(resultDiv);
    }

    // 绑定点击事件
    btn.onclick = testAI;
})(); 