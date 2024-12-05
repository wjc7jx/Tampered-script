// ==UserScript==
// @name         B站收藏夹自动整理
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动整理B站收藏夹内容,基于内容相似度进行智能分类
// @author       Your name
// @match        https://space.bilibili.com/*/favlist*
// @match        https://www.bilibili.com/medialist/detail/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      api.bilibili.com
// ==/UserScript==

(function() {
    'use strict';
    
    // 配置项
    const CONFIG = {
        minSimilarity: 0.6, // 最小相似度阈值
        maxNewFolders: 10,  // 最大新建收藏夹数量
        apiDelay: 1000,     // API请求间隔(ms)
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
                const response = await request({
                    url: 'https://api.bilibili.com/x/v3/fav/folder/add',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    data: `title=${encodeURIComponent(title)}&csrf=${getCsrf()}`
                });
                
                if (!response || response.code !== 0) {
                    throw new Error(response?.message || '创建收藏夹失败');
                }
                
                return response;
            } catch (err) {
                console.error('创建收藏夹失败:', err);
                throw err;
            }
        },

        // 移动视频到其他收藏夹
        moveResource: async (mediaId, resources, targetId) => {
            return await request({
                url: 'http://api.bilibili.com/x/v3/fav/resource/move',
                method: 'POST', 
                data: {
                    src_media_id: mediaId,
                    tar_media_id: targetId,
                    resources,
                    csrf: getCsrf()
                }
            });
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
                onload: (response) => resolve(response.response),
                onerror: reject
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
            console.error('计算相似度失败:', err, {video1, video2});
            return 0; // 出错时返回0相似度
        }
    }

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
                console.error('未找到整理按钮');
            }
        }

        showConfig() {
            // 显示配置对话框
            const dialog = document.createElement('div');
            dialog.innerHTML = `
                <div class="config-dialog">
                    <h3>收藏夹整理配置</h3>
                    <div>
                        <label>
                            <input type="checkbox" name="autoCreate" checked>
                            自动创建新收藏夹
                        </label>
                    </div>
                    <div>
                        <label>相似度阈值:</label>
                        <input type="range" name="similarity" min="0" max="100" value="60">
                    </div>
                    <button class="start-btn">开始整理</button>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            dialog.querySelector('.start-btn').onclick = () => {
                this.startOrganize({
                    autoCreate: dialog.querySelector('[name=autoCreate]').checked,
                    similarity: dialog.querySelector('[name=similarity]').value / 100
                });
                dialog.remove();
            };
        }

        async startOrganize(config) {
            try {
                // 1. 获取所有收藏内容
                const items = await this.getAllFavItems();
                
                // 2. 分析并分类
                const groups = this.groupItems(items);
                
                // 3. 创建新收藏夹(如果需要)
                if(config.autoCreate) {
                    await this.createNewFolders(groups);
                }
                
                // 4. 移动视频
                await this.moveVideos(groups);
                
                // 5. 显示结果
                this.showResult(groups);
                
            } catch(err) {
                console.error('整理失败:', err);
                alert('整理失败,请查看控制台');
            }
        }

        async getAllFavItems() {
            try {
                // 首先获取用户的 uid
                const uid = location.pathname.split('/')[1];
                if (!uid) {
                    throw new Error('无法获取用户ID');
                }

                // 先获取用户的收藏夹列表
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
                            // 计算与组内视频的平均相似度
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
                    return '未分类视频';
                }
                
                // 使用前两个词作为分组名
                const groupName = words.slice(0, 2).join('');
                return groupName + '相关视频';
            } catch (err) {
                console.error('生成分组名��败:', err);
                return '未命名分组';
            }
        }

        async createNewFolders(groups) {
            try {
                console.log('开始创建新收藏夹，共', groups.length, '个分组');
                
                for(const group of groups) {
                    if(groups.length > CONFIG.maxNewFolders) {
                        console.log('达到最大收藏夹数量限制');
                        break;
                    }
                    
                    console.log('创建收藏夹:', group.name);
                    const res = await API.createFavFolder(group.name);
                    
                    if (!res?.data?.id) {
                        console.error('创建收藏夹失败，返回数据:', res);
                        throw new Error('创建收藏夹失败：无效的返回数据');
                    }
                    
                    group.folderId = res.data.id;
                    console.log('收藏夹创建成功，id:', group.folderId);
                    
                    await new Promise(r => setTimeout(r, CONFIG.apiDelay));
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
    }

    // 初始化
    new FavOrganizer();
})(); 