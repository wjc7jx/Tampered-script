// ==UserScript==
// @name         B站收藏夹自动整理
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动整理B站收藏夹内容,基于AI和内容相似度进行智能分类
// @author       Your name
// @match        https://space.bilibili.com/*/favlist*
// @match        https://www.bilibili.com/medialist/detail/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.bilibili.com
// @connect      api.siliconflow.cn
// ==/UserScript==

(function() {
    'use strict';
    
    // 配置项
    const CONFIG = {
        minSimilarity: 0.5,    // 降低默认匹配阈值
        apiDelay: 1000,        // 请求间隔
        debug: true,           // 开启调试日志
    };

    // AI API 配置
    const AI_CONFIG = {
        url: 'https://api.siliconflow.cn/v1/chat/completions',
        token: 'sk-nmhcrymaktgoupxtlfufbomowoohjsnfzrhkpbcejdjutgos',
        model: 'Qwen/Qwen2.5-7B-Instruct'
    };

    // API接口
    const API = {
        // 获取收藏夹列表
        getFavList: async (uid) => {
            try {
                const response = await request({
                    url: `https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${uid}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!response || response.code !== 0) {
                    throw new Error(response?.message || '未知错误');
                }
                
                return response;
            } catch (err) {
                console.error('获取收藏夹列表失败:', err);
                throw err;
            }
        },

        // 获取收藏夹内容
        getFavItems: async (mediaId, ps = 20, pn = 1) => {
            try {
                const response = await request({
                    url: `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${mediaId}&pn=${pn}&ps=${ps}&platform=web`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!response || response.code !== 0) {
                    throw new Error(response?.message || '未知错误');
                }
                
                return response;
            } catch (err) {
                console.error('API请求失败:', err);
                throw err;
            }
        },

        // 创建新收藏夹
        createFavFolder: async (title) => {
            try {
                const csrf = getCsrf();
                if (!csrf) {
                    throw new Error('获取 csrf token 失败');
                }

                // 构建请求数据
                const formData = new URLSearchParams();
                formData.append('title', title);
                formData.append('privacy', 0);
                formData.append('csrf', csrf);
                formData.append('jsonp', 'jsonp');

                console.log('创建收藏夹请求数据:', {
                    title,
                    csrf,
                    formData: formData.toString()
                });

                const response = await request({
                    url: 'https://api.bilibili.com/x/v3/fav/folder/add',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': 'https://space.bilibili.com',
                        'Referer': 'https://space.bilibili.com/',
                    },
                    data: formData.toString()
                });
                
                console.log('创建收藏夹响应:', response);

                if (!response || response.code !== 0) {
                    throw new Error(response?.message || '创建收藏夹失败');
                }
                
                if (!response.data?.id) {
                    throw new Error('创建收藏夹成功但未返回ID');
                }

                return response;
            } catch (err) {
                console.error('创建收藏夹失败:', err);
                throw err;
            }
        },

        // 移动视频到其他收藏夹
        moveResource: async (mediaId, resources, targetId) => {
            try {
                const csrf = getCsrf();
                if (!csrf) {
                    throw new Error('获取 csrf token 失败');
                }

                // 构建请求数据
                const formData = new URLSearchParams();
                formData.append('src_media_id', mediaId);
                formData.append('tar_media_id', targetId);
                formData.append('resources', resources);
                formData.append('platform', 'web');
                formData.append('csrf', csrf);

                const response = await request({
                    url: 'https://api.bilibili.com/x/v3/fav/resource/move',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    data: formData.toString()
                });

                console.log('移动视频响应:', response);

                if (!response || response.code !== 0) {
                    throw new Error(response?.message || '移动视频失败');
                }

                return response;
            } catch (err) {
                console.error('移动视频失败:', err);
                throw err;
            }
        }
    };

    // 工具函数
    function getCsrf() {
        return document.cookie.match(/bili_jct=([^;]+)/)?.[1] || '';
    }

    async function request(options) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                ...options,
                responseType: 'json',
                timeout: 10000,
                onload: (response) => {
                    try {
                        console.log(`API响应 [${options.url}]:`, response);
                        if (response.status !== 200) {
                            reject(new Error(`HTTP错误: ${response.status}`));
                            return;
                        }
                        resolve(response.response);
                    } catch (err) {
                        reject(err);
                    }
                },
                onerror: (error) => {
                    console.error('请求失败:', error);
                    reject(new Error('网络请求失败'));
                },
                ontimeout: () => {
                    reject(new Error('请求超时'));
                }
            });
        });
    }

    // 分析频内容相似度
    function analyzeSimilarity(video1, video2) {
        try {
            // 构建文本，只使用标题和简介，忽略可能不存在的tags
            const text1 = `${video1.title || ''} ${video1.intro || ''} ${video1.description || ''}`;
            const text2 = `${video2.title || ''} ${video2.intro || ''} ${video2.description || ''}`;
            
            // 分词 - 使用更多的分隔符
            const words1 = new Set(text1.toLowerCase().split(/[\s,，.。!！?？、]/));
            const words2 = new Set(text2.toLowerCase().split(/[\s,，.。!！?？、]/));
            
            // 移除空字符串
            words1.delete('');
            words2.delete('');
            
            if (words1.size === 0 || words2.size === 0) {
                return 0;
            }

            // 计算交集
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            
            // 计算相似度
            return intersection.size / Math.max(words1.size, words2.size);
        } catch (err) {
            console.error('计算相似度失:', err, {video1, video2});
            return 0; // 出错时返回0相似度
        }
    }

    // 将 askAI 函数移到类定义之前
    const askAI = async (prompt) => {
        try {
            console.log('发送 AI 请求, prompt:', prompt);
            
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
                            content: prompt
                        }],
                        stream: false,
                        max_tokens: 512,
                        temperature: 0.7,
                        top_p: 0.7
                    }),
                    responseType: 'json',
                    onload: (response) => {
                        if (response.status === 200) {
                            resolve(response.response);
                        } else {
                            reject(new Error(`HTTP错误: ${response.status}`));
                        }
                    },
                    onerror: (error) => {
                        reject(new Error('请求失败: ' + error.toString()));
                    }
                });
            });

            console.log('AI 响应:', response);

            if (!response.choices?.[0]?.message?.content) {
                throw new Error('AI 响应格式错误');
            }

            return response.choices[0].message.content;
        } catch (err) {
            console.error('AI 请求失败:', err);
            return null;
        }
    };


    // 主要逻辑
    class FavOrganizer {
        constructor() {
            this.init();
        }

        async init() {
            // 添加UI
            this.addButton();
            // 绑定事件
            this.bindEvents();
        }

        addButton() {
            const btn = document.createElement('button');
            btn.textContent = '整理收藏夹';
            btn.className = 'organize-btn';
            btn.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
                padding: 8px 16px;
                background: #00a1d6;
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            
            // 移除原来的选择器,直接添加到 body
            document.body.appendChild(btn);
        }

        bindEvents() {
            const btn = document.querySelector('.organize-btn');
            if(btn) {
                btn.onclick = () => {
                    this.showConfig();
                };
            } else {
                console.error('未到整理按钮');
            }
        }

        showConfig() {
            const dialog = document.createElement('div');
            dialog.innerHTML = `
                <div class="config-dialog" style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 10000;
                ">
                    <h3>收藏夹整理配置</h3>
                    <div style="margin: 10px 0;">
                        <label>
                            <input type="checkbox" name="useAI" checked>
                            使用 AI 智能匹配
                        </label>
                        <p style="color: #666; font-size: 12px;">
                            AI 匹配更准确但速度较慢，取消勾选将使用传统匹配方式
                        </p>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>
                            最小匹配度：
                            <input type="range" name="similarity" min="0" max="100" value="${CONFIG.minSimilarity * 100}"
                                oninput="this.nextElementSibling.textContent = this.value + '%'">
                            <span>${CONFIG.minSimilarity * 100}%</span>
                        </label>
                    </div>
                    <div style="margin-top: 20px;">
                        <button class="start-btn" style="
                            background: #00a1d6;
                            color: white;
                            border: none;
                            padding: 8px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                        ">开始整理</button>
                        <button class="cancel-btn" style="
                            margin-left: 10px;
                            padding: 8px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                        ">取消</button>
                    </div>
                </div>
            `;

            const startBtn = dialog.querySelector('.start-btn');
            const cancelBtn = dialog.querySelector('.cancel-btn');
            const useAICheckbox = dialog.querySelector('input[name="useAI"]');
            const similarityInput = dialog.querySelector('input[name="similarity"]');

            startBtn.onclick = () => {
                const config = {
                    useAI: useAICheckbox.checked,
                    minSimilarity: parseInt(similarityInput.value) / 100
                };
                dialog.remove();
                this.startOrganize(config);
            };

            cancelBtn.onclick = () => dialog.remove();

            document.body.appendChild(dialog);
        }

        async startOrganize(config) {
            try {
                // 1. 获取所有收藏夹
                const uid = location.pathname.split('/')[1];
                const favListRes = await API.getFavList(uid);
                const allFolders = favListRes.data.list;
                console.log('获取到的收藏夹列表:', allFolders);

                // 2. 获取当前收藏夹的视频
                const currentFolderId = favListRes.data.list[0].id;
                const items = await this.getAllFavItems();
                console.log('当前收藏夹视频数:', items.length);

                // 3. 为每个视频找到最匹配的收藏夹
                const moveActions = await this.matchVideosToFolders(items, allFolders, currentFolderId);
                
                // 4. 执行移动操作
                await this.executeMove(moveActions, currentFolderId);
                
                // 5. 显示结果
                this.showMatchResult(moveActions);
                
            } catch(err) {
                console.error('整理失败:', err);
                alert('整理失败: ' + err.message);
            }
        }

        async getAllFavItems() {
            try {
                // 首先获取用户的 uid
                const uid = location.pathname.split('/')[1];
                if (!uid) {
                    throw new Error('无法获取用户ID');
                }

                // 先获取用户的收藏夹表
                const favListRes = await API.getFavList(uid);
                console.log('获取收藏夹列表:', favListRes);

                if (!favListRes?.data?.list?.[0]?.id) {
                    throw new Error('获取收藏夹列表失败');
                }

                // 使第一个收藏夹的 id
                const mediaId = favListRes.data.list[0].id;
                console.log('使用收藏夹ID:', mediaId);

                const items = [];
                let page = 1;
                
                while (true) {
                    const res = await API.getFavItems(mediaId, 20, page);
                    console.log(`获取第${page}页数据:`, res);
                    
                    if (!res.data?.medias?.length) {
                        break;
                    }
                    
                    items.push(...res.data.medias);
                    
                    if (items.length >= res.data.info.total) {
                        break;
                    }
                    
                    page++;
                    await new Promise(r => setTimeout(r, CONFIG.apiDelay));
                }
                
                console.log('获取完成,共获取到视频数:', items.length);
                return items;
            } catch (err) {
                console.error('获取收藏夹内容失败:', err);
                throw new Error(`获取收藏夹内容失败: ${err.message}`);
            }
        }

        groupItems(items) {
            try {
                console.log('开始分组，视频数:', items.length);
                const groups = [];
                
                for(const item of items) {
                    if (!item?.title) {
                        console.warn('跳过无标题视频:', item);
                        continue;
                    }

                    let added = false;
                    
                    for(const group of groups) {
                        try {
                            // 算与组内视频的平均相似度
                            const similarities = group.items.map(groupItem => 
                                analyzeSimilarity(item, groupItem)
                            );
                            const avgSimilarity = similarities.reduce((a, b) => a + b, 0) / similarities.length;
                            
                            if(avgSimilarity >= CONFIG.minSimilarity) {
                                group.items.push(item);
                                added = true;
                                break;
                            }
                        } catch (err) {
                            console.error('计算组内相似度失败:', err);
                            continue;
                        }
                    }
                    
                    if(!added) {
                        groups.push({
                            name: this.generateGroupName(item),
                            items: [item]
                        });
                    }
                }
                
                console.log('分组完成，共分为', groups.length, '组');
                return groups;
            } catch (err) {
                console.error('分组失败:', err);
                throw new Error('视频分组失败: ' + err.message);
            }
        }

        generateGroupName(item) {
            try {
                // 提取更有意义的分组名
                const title = item.title || '';
                
                // 移除特殊字符
                const cleanTitle = title.replace(/[《》【】\[\]()（）]/g, ' ');
                
                // 分词并过滤空字符串
                const words = cleanTitle.split(/[\s,，.。!！?？、]/).filter(w => w);
                
                if (words.length === 0) {
                    return '未类视频';
                }
                
                // 使用前两个词作为分组名
                const groupName = words.slice(0, 2).join('');
                return groupName + '相关视频';
            } catch (err) {
                console.error('生成分组名败:', err);
                return '未命名分组';
            }
        }

        async createNewFolders(groups) {
            try {
                console.log('开始创建新收藏夹，共', groups.length, '个分组');
                
                let createdCount = 0;
                for(const group of groups) {
                    if(createdCount >= CONFIG.maxNewFolders) {
                        console.log('达到最大收藏夹数量限制');
                        break;
                    }
                    
                    let retryCount = 3;
                    while (retryCount > 0) {
                        try {
                            console.log(`创建收藏夹: ${group.name} (剩余重试次数: ${retryCount})`);
                            const res = await API.createFavFolder(group.name);
                            
                            if (!res?.data?.id) {
                                throw new Error('创建收藏夹失败：无效的返回数据');
                            }
                            
                            group.folderId = res.data.id;
                            console.log('收藏夹创建成功，id:', group.folderId);
                            createdCount++;
                            break;
                        } catch (err) {
                            retryCount--;
                            if (retryCount === 0) {
                                throw err;
                            }
                            console.log(`创建失败，${retryCount}秒后重试...`);
                            await new Promise(r => setTimeout(r, 1000));
                        }
                    }
                    
                    await new Promise(r => setTimeout(r, CONFIG.apiDelay));
                }
                
                if (createdCount === 0) {
                    throw new Error('没有成功创建任何收藏夹');
                }
                
                console.log('所有收藏夹创建完成');
            } catch (err) {
                console.error('创建收藏夹失败:', err);
                throw new Error('创建收藏夹失败: ' + err.message);
            }
        }

        async moveVideos(groups) {
            try {
                // 获取当前收藏夹的 mediaId
                const uid = location.pathname.split('/')[1];
                const favListRes = await API.getFavList(uid);
                const mediaId = favListRes.data.list[0].id;
                
                console.log('开始移动视频，源收藏夹ID:', mediaId);
                
                for(const group of groups) {
                    if(!group.folderId) {
                        console.warn('跳过没有folderId的分组:', group.name);
                        continue;
                    }
                    
                    const resources = group.items.map(item => item.id).join(',');
                    console.log(`移动视频到收藏夹 ${group.name}(${group.folderId}), 共${group.items.length}个视频`);
                    
                    await API.moveResource(mediaId, resources, group.folderId);
                    console.log(`移动完成: ${group.name}`);
                    
                    await new Promise(r => setTimeout(r, CONFIG.apiDelay));
                }
                
                console.log('所有视频移动完成');
            } catch (err) {
                console.error('移动视频失败:', err);
                throw new Error('移动视频失败: ' + err.message);
            }
        }

        showResult(groups) {
            const dialog = document.createElement('div');
            dialog.innerHTML = `
                <div class="result-dialog">
                    <h3>整理完成</h3>
                    <div class="groups">
                        ${groups.map(group => `
                            <div class="group">
                                <h4>${group.name}</h4>
                                <p>共${group.items.length}视频</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
        }

        // 修改 matchVideosToFolders 方法
        async matchVideosToFolders(videos, folders, currentFolderId) {
            const moveActions = [];
            console.log('开始匹配视频与收藏夹...');
            
            for(const video of videos) {
                let bestMatch = {
                    folderId: null,
                    folderName: '',
                    similarity: 0
                };

                // 遍历所有收藏夹(除了当前收藏夹)
                for(const folder of folders) {
                    if(folder.id === currentFolderId) continue;

                    // 使用 AI 计算匹配度
                    const similarity = await this.getAISimilarity(video, folder);
                    console.log('💗💗AI 匹配结果:',similarity)
                    console.log(`视频 "${video.title}" 与收藏夹 "${folder.title}" 的匹配度: ${similarity}`);
                    
                    if(similarity > bestMatch.similarity && similarity >= CONFIG.minSimilarity) {
                        bestMatch = {
                            folderId: folder.id,
                            folderName: folder.title,
                            similarity
                        };
                    }
                }

                if(bestMatch.folderId) {
                    moveActions.push({
                        video,
                        targetFolder: bestMatch,
                    });
                }
            }

            console.log('匹配完成，结果:', moveActions);
            return moveActions;
        }

        // 新增 AI 匹配方法
        async getAISimilarity(video, folder) {
            try {
                const prompt = `
请分析以下视频是否适合放入这个收藏夹。请只回复一个0到1之间的数字，表示匹配度。

视频信息：
标题：${video.title || '无'}
描述：${video.desc || '无'}
标签：${video.tags?.join(', ') || '无'}

收藏夹信息：
名称：${folder.title || '无'}
描述：${folder.intro || '无'}

只需返回一个数字，不要包含任何其他文字。`;

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
                                content: prompt
                            }],
                            stream: false,
                            max_tokens: 512,
                            temperature: 0.7,
                            top_p: 0.7
                        }),
                        responseType: 'json',
                        onload: function(response) {
                            if (response.status === 200) {
                                resolve(response.response);
                            } else {
                                reject(new Error(`HTTP错误: ${response.status}`));
                            }
                        },
                        onerror: function(error) {
                            reject(error);
                        }
                    });
                });
                console.log('AI返回结果:', response);

                const similarity = parseFloat(response.choices[0].message.content.trim());
                
                if (isNaN(similarity) || similarity < 0 || similarity > 1) {
                    console.warn('AI返回的相似度无效，使用传统匹配方法');
                    return this.calculateTraditionalMatch(video, folder);
                }

                return similarity;

            } catch (err) {
                console.error('AI匹配失败，使用传统匹配方法:', err);
                return this.calculateTraditionalMatch(video, folder);
            }
        }

        // 保留原有的传统匹配方法作为备选
        calculateTraditionalMatch(video, folder) {
            // 1. 标题匹配
            const titleSimilarity = this.calculateTextSimilarity(
                video.title || '',
                folder.title || ''
            );

            // 2. 标签匹配
            let tagSimilarity = 0;
            if (video.tags && video.tags.length > 0) {
                tagSimilarity = this.calculateTextSimilarity(
                    video.tags.join(' '),
                    folder.title
                );
            }

            // 3. 简介匹配
            let descSimilarity = 0;
            if (video.desc) {
                descSimilarity = this.calculateTextSimilarity(
                    video.desc,
                    folder.title
                );
            }

            // 加权计算总相似度
            return (
                titleSimilarity * 0.6 +
                tagSimilarity * 0.3 +
                descSimilarity * 0.1
            );
        }

        // 新增文本相似度计算方法
        calculateTextSimilarity(text1, text2) {
            // 预处理文本
            const processText = (text) => {
                return text.toLowerCase()
                    .replace(/[《》【】\[\]()（）]/g, ' ')
                    .replace(/[,，.。!！?？、]/g, ' ')
                    .split(/\s+/)
                    .filter(w => w.length > 0);
            };

            const words1 = new Set(processText(text1));
            const words2 = new Set(processText(text2));

            if (words1.size === 0 || words2.size === 0) return 0;

            // 计算交集
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            
            // 使用 Jaccard 相似度
            const union = new Set([...words1, ...words2]);
            return intersection.size / union.size;
        }

        // 新增 executeMove 方法
        async executeMove(moveActions, currentFolderId) {
            // 按目标收藏夹分组
            const groupedActions = {};
            for(const action of moveActions) {
                const folderId = action.targetFolder.folderId;
                if(!groupedActions[folderId]) {
                    groupedActions[folderId] = [];
                }
                groupedActions[folderId].push(action.video);
            }
            
            // 批量移动
            for(const [folderId, videos] of Object.entries(groupedActions)) {
                const resources = videos.map(v => `${v.id}:2`).join(',');
                console.log(`移动 ${videos.length} 个视频到收藏夹 ${folderId}`);
                
                try {
                    await API.moveResource(currentFolderId, resources, folderId);
                    console.log(`移动成功`);
                } catch(err) {
                    console.error(`移动失败:`, err);
                }
                
                await new Promise(r => setTimeout(r, CONFIG.apiDelay));
            }
        }

        // 修改 showResult 方法为 showMatchResult
        showMatchResult(moveActions) {
            const dialog = document.createElement('div');
            dialog.innerHTML = `
                <div class="result-dialog" style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 10000;
                    max-height: 80vh;
                    overflow-y: auto;
                    min-width: 500px;
                ">
                    <h3>整理完成</h3>
                    <div class="summary">
                        <p>共处理 ${moveActions.length} 个视频</p>
                    </div>
                    <div class="details" style="margin-top: 10px;">
                        ${moveActions.map(action => `
                            <div class="move-item" style="
                                border-bottom: 1px solid #eee;
                                padding: 10px 0;
                            ">
                                <div style="margin-bottom: 5px;">视频：${action.video.title}</div>
                                <div style="color: #00a1d6;">移动到：${action.targetFolder.folderName}</div>
                                <div style="color: ${action.targetFolder.similarity > 0.7 ? '#4caf50' : '#ff9800'};">
                                    匹配度：${(action.targetFolder.similarity * 100).toFixed(1)}%
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="this.parentElement.remove()" style="
                        margin-top: 15px;
                        padding: 8px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">关闭</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
        }
    }

    // 初始化
    new FavOrganizer();
})(); 