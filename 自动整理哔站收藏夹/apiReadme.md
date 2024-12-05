# 文件夹部分


# 收藏夹操作

* [管理收藏夹](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E7%AE%A1%E7%90%86%E6%94%B6%E8%97%8F%E5%A4%B9)
  * [新建收藏夹](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E6%96%B0%E5%BB%BA%E6%94%B6%E8%97%8F%E5%A4%B9)
  * [修改收藏夹](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E4%BF%AE%E6%94%B9%E6%94%B6%E8%97%8F%E5%A4%B9)
  * [删除收藏夹](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E5%88%A0%E9%99%A4%E6%94%B6%E8%97%8F%E5%A4%B9)
* [管理收藏内容](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E7%AE%A1%E7%90%86%E6%94%B6%E8%97%8F%E5%86%85%E5%AE%B9)
  * [批量复制内容](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E6%89%B9%E9%87%8F%E5%A4%8D%E5%88%B6%E5%86%85%E5%AE%B9)
  * [清空所有失效内容](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/action.md#%E6%B8%85%E7%A9%BA%E6%89%80%E6%9C%89%E5%A4%B1%E6%95%88%E5%86%85%E5%AE%B9)

---

## 管理收藏夹

### 新建收藏夹

> [http://api.bilibili.com/x/v3/fav/folder/add](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Ffolder%2Fadd)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名  | 类型 | 内容                     | 必要性         | 备注                               |
| ------- | ---- | ------------------------ | -------------- | ---------------------------------- |
| title   | str  | 收藏夹标题               | 必要           |                                    |
| intro   | str  | 收藏夹简介               | 非必要         | 默认为空                           |
| privacy | num  | 是否公开                 | 非必要         | 默认为公开<br/>0：公开<br/>1：私密 |
| cover   | str  | 封面图url                | 非必要         | 封面会被审核                       |
| csrf    | str  | CSRF Token（位于cookie） | Cookie方式必要 |                                    |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 | 默认为0 |
| ttl     | num  | 1        |         |
| data    | obj  | 信息本体 |         |

`data`对象：

略....

详见[获取收藏夹元数据](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/info.md#%E8%8E%B7%E5%8F%96%E6%94%B6%E8%97%8F%E5%A4%B9%E5%85%83%E6%95%B0%E6%8D%AE)中的`data`对象

**示例：**

创建一个叫`test`,简介是`2333`,封面`http://i0.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png`,的公开收藏夹:

```
curl 'http://api.bilibili.com/x/v3/fav/folder/add' \
--data-urlencode 'title=test' \
--data-urlencode 'intro=2333' \
--data-urlencode 'privacy=0' \
--data-urlencode 'cover=http://i0.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png' \
--data-urlencode 'csrf=xxxx' \
-b 'SESSDATA=xxxx'
```

<details><summary>查看响应示例：</summary>

```

```

### 修改收藏夹

> [http://api.bilibili.com/x/v3/fav/folder/edit](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Ffolder%2Fedit)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名    | 类型 | 内容                     | 必要性         | 备注                                    |
| --------- | ---- | ------------------------ | -------------- | --------------------------------------- |
| media\_id | num  | 目标收藏夹mdid           | 必要           |                                         |
| title     | str  | 修改收藏夹标题           | 必要           |                                         |
| intro     | str  | 修改收藏夹简介           | 非必要         |                                         |
| privacy   | num  | 是否公开                 | 非必要         | 默认为公开<br/><br/>0：公开<br/>1：私密 |
| cover     | str  | 封面图url                | 非必要         | 封面会被审核                            |
| csrf      | str  | CSRF Token（位于cookie） | Cookie方式必要 |                                         |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 | 默认为0 |
| ttl     | num  | 1        |         |
| data    | obj  | 信息本体 |         |

`data`对象：

略....

详见[获取收藏夹元数据](https://gitee.com/dhcy/bilibili-API-collect/blob/master/fav/info.md#%E8%8E%B7%E5%8F%96%E6%94%B6%E8%97%8F%E5%A4%B9%E5%85%83%E6%95%B0%E6%8D%AE)中的`data`对象

**示例：**

修改id为`1182306172`的名字为`test`,简介为`2333`,封面为`http://i0.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png`,公开收藏夹:

```
curl 'http://api.bilibili.com/x/v3/fav/folder/edit' \
--data-urlencode 'media_id=1182306172' \
--data-urlencode 'title=test' \
--data-urlencode 'intro=2333' \
--data-urlencode 'privacy=0' \
--data-urlencode 'cover=http://i0.hdslb.com/bfs/space/cb1c3ef50e22b6096fde67febe863494caefebad.png' \
--data-urlencode 'csrf=xxxx' \
-b 'SESSDATA=xxxx'
```

<details><summary>查看响应示例：</summary>

```

```

### 删除收藏夹

> [http://api.bilibili.com/x/v3/fav/folder/del](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Ffolder%2Fdel)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名     | 类型 | 内容                     | 必要性         | 备注                |
| ---------- | ---- | ------------------------ | -------------- | ------------------- |
| media\_ids | nums | 目标收藏夹mdid列表       | 必要           | 每个成员间用`,`分隔 |
| csrf       | str  | CSRF Token（位于cookie） | Cookie方式必要 |                     |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 | 成功为0 |
| ttl     | num  | 1        |         |
| data    | num  | 信息本体 | 成功为0 |

**示例：**

删除id为`1182306172`的收藏夹:

```
curl 'http://api.bilibili.com/x/v3/fav/folder/del' \
--data-urlencode 'media_ids=1182306172' \
--data-urlencode 'csrf=xxxx' \
-b 'SESSDATA=xxxx'
```

<details><summary>查看响应示例：</summary>

```

```

## 管理收藏内容

### 批量复制内容

> [http://api.bilibili.com/x/v3/fav/resource/copy](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Fresource%2Fcopy)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名         | 类型 | 内容                     | 必要性         | 备注                                                                                                                                                                                           |
| -------------- | ---- | ------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src\_media\_id | num  | 源收藏夹id               | 必要           |                                                                                                                                                                                                |
| tar\_media\_id | num  | 目标收藏夹id             | 必要           |                                                                                                                                                                                                |
| mid            | num  | 当前用户mid              | 必要           |                                                                                                                                                                                                |
| resources      | strs | 目标内容id列表           | 必要           | 格式：{内容id}:{内容类型}<br/>每个成员间用`,`分隔<br/>类型：<br/>2：视频稿件<br/>12：音频<br/>21：视频合集<br/>内容id：<br/>视频稿件：视频稿件avid<br/>音频：音频auid<br/>视频合集：视频合集id |
| platform       | str  | 平台标识                 | 非必要         | 可为web                                                                                                                                                                                        |
| csrf           | str  | CSRF Token（位于cookie） | Cookie方式必要 |                                                                                                                                                                                                |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注                                                                                                 |
| ------- | ---- | -------- | ---------------------------------------------------------------------------------------------------- |
| code    | num  | 返回值   | 0：成功<br/>-101：账号未登录<br/>-111：csrf校验失败<br/>-400：请求错误<br/>11010：您访问的内容不存在 |
| message | str  | 错误信息 | 默认为0                                                                                              |
| ttl     | num  | 1        |                                                                                                      |
| data    | obj  | 信息本体 | 成功为0                                                                                              |

**示例：**

将id为`1288061499`的收藏夹中视频稿件`av21822819` `av21918689` `av22288065`复制到id为`1178751999`的收藏夹中

清理id为`1161340172`的收藏夹

```
curl 'http://api.bilibili.com/x/v3/fav/resource/copy' \
--data-urlencode 'src_media_id=1288061499' \
--data-urlencode 'tar_media_id=1178751999' \
--data-urlencode 'mid=233333' \
--data-urlencode 'resources=21822819:2,21918689:2,22288065:2' \
--data-urlencode 'platform=web' \
--data-urlencode 'csrf=xxx' \
-b 'SESSDATA=xxx'
```

<details><summary>查看响应示例：</summary>

```

```

### 批量移动内容

> [http://api.bilibili.com/x/v3/fav/resource/move](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Fresource%2Fmove)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名         | 类型 | 内容                     | 必要性         | 备注                                                                                                                                                                                           |
| -------------- | ---- | ------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src\_media\_id | num  | 源收藏夹id               | 必要           |                                                                                                                                                                                                |
| tar\_media\_id | num  | 目标收藏夹id             | 必要           |                                                                                                                                                                                                |
| mid            | num  | 当前用户mid              | 必要           |                                                                                                                                                                                                |
| resources      | strs | 目标内容id列表           | 必要           | 格式：{内容id}:{内容类型}<br/>每个成员间用`,`分隔<br/>类型：<br/>2：视频稿件<br/>12：音频<br/>21：视频合集<br/>内容id：<br/>视频稿件：视频稿件avid<br/>音频：音频auid<br/>视频合集：视频合集id |
| platform       | str  | 平台标识                 | 非必要         | 可为web                                                                                                                                                                                        |
| csrf           | str  | CSRF Token（位于cookie） | Cookie方式必要 |                                                                                                                                                                                                |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注                                                                                                 |
| ------- | ---- | -------- | ---------------------------------------------------------------------------------------------------- |
| code    | num  | 返回值   | 0：成功<br/>-101：账号未登录<br/>-111：csrf校验失败<br/>-400：请求错误<br/>11010：您访问的内容不存在 |
| message | str  | 错误信息 | 默认为0                                                                                              |
| ttl     | num  | 1        |                                                                                                      |
| data    | obj  | 信息本体 | 成功为0                                                                                              |

**示例：**

将id为`1288061499`的收藏夹中视频稿件`av21822819` `av21918689` `av22288065`移动到id为`1178751999`的收藏夹中

清理id为`1161340172`的收藏夹

```
curl 'http://api.bilibili.com/x/v3/fav/resource/move' \
--data-urlencode 'src_media_id=1288061499' \
--data-urlencode 'tar_media_id=1178751999' \
--data-urlencode 'mid=233333' \
--data-urlencode 'resources=21822819:2,21918689:2,22288065:2' \
--data-urlencode 'platform=web' \
--data-urlencode 'csrf=xxx' \
-b 'SESSDATA=xxx'
```

<details><summary>查看响应示例：</summary>

```

```

### 批量删除内容

> [http://api.bilibili.com/x/v3/fav/resource/batch-del](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Fresource%2Fbatch-del)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名    | 类型           | 内容                     | 必要性                                                                                                                                                                                         | 备注    |
| --------- | -------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| resources | 目标内容id列表 | 必要                     | 格式：{内容id}:{内容类型}<br/>每个成员间用`,`分隔<br/>类型：<br/>2：视频稿件<br/>12：音频<br/>21：视频合集<br/>内容id：<br/>视频稿件：视频稿件avid<br/>音频：音频auid<br/>视频合集：视频合集id |         |
| media\_id | num            | 目标收藏夹id             | 必要                                                                                                                                                                                           |         |
| platform  | str            | 平台标识                 | 非必要                                                                                                                                                                                         | 可为web |
| csrf      | str            | CSRF Token（位于cookie） | Cookie方式必要                                                                                                                                                                                 |         |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注                                                                                                 |
| ------- | ---- | -------- | ---------------------------------------------------------------------------------------------------- |
| code    | num  | 返回值   | 0：成功<br/>-101：账号未登录<br/>-111：csrf校验失败<br/>-400：请求错误<br/>11010：您访问的内容不存在 |
| message | str  | 错误信息 | 默认为0                                                                                              |
| ttl     | num  | 1        |                                                                                                      |
| data    | obj  | 信息本体 | 成功为0                                                                                              |

**示例：**

将id为`1178751999`的收藏夹中视频稿件`av21822819` `av21918689` `av22288065`取消收藏

```
curl 'http://api.bilibili.com/x/v3/fav/resource/batch-del' \
--data-urlencode 'resources=21822819:2,21918689:2,22288065:2' \
--data-urlencode 'media_id=1178751999' \
--data-urlencode 'platform=web' \
--data-urlencode 'csrf=xxx' \
-b 'SESSDATA=xxx'
```

<details><summary>查看响应示例：</summary>

```

```

### 清空所有失效内容

> [http://api.bilibili.com/x/v3/fav/resource/clean](https://gitee.com/link?target=http%3A%2F%2Fapi.bilibili.com%2Fx%2Fv3%2Ffav%2Fresource%2Fclean)

*请求方式：POST*

认证方式：APP或Cookie（SESSDATA）

**正文参数（ application/x-www-form-urlencoded ）：**


| 参数名    | 类型 | 内容                     | 必要性         | 备注 |
| --------- | ---- | ------------------------ | -------------- | ---- |
| media\_id | num  | 目标收藏夹id             | 必要           |      |
| csrf      | str  | CSRF Token（位于cookie） | Cookie方式必要 |      |

**json回复：**

根对象：


| 字段    | 类型 | 内容     | 备注    |
| ------- | ---- | -------- | ------- |
| code    | num  | 返回值   | 0：成功 |
| message | str  | 错误信息 | 默认为0 |
| ttl     | num  | 1        |         |
| data    | obj  | 信息本体 | 成功为0 |

**示例：**

清理id为`1161340172`的收藏夹

```
curl 'http://api.bilibili.com/x/v3/fav/resource/clean' \
--data-urlencode 'media_id=1161340172' \
--data-urlencode 'csrf=xxx' \
-b 'SESSDATA=xxx'
```

<details><summary>查看响应示例：</summary>

```

```

</details>

</details>

</details>

</details>

</details>

</details>

</details>

[![Gitee - 基于 Git 的代码托管和研发协作平台](https://gitee.com/static/images/logo-black.svg?t=158106666)](https://gitee.com/)

深圳市奥思网络科技有限公司版权所有

[Git 大全](https://gitee.com/all-about-git)

[Git 命令学习](https://help.gitee.com/learn-Git-Branching/)

[CopyCat 代码克隆检测](https://copycat.gitee.com/)

[APP与插件下载](https://gitee.com/appclient)

[Gitee Reward](https://gitee.com/gitee_reward)

[Gitee 封面人物](https://gitee.com/gitee-stars)

[GVP 项目](https://gitee.com/gvp)

[Gitee 博客](https://blog.gitee.com/)

[Gitee 公益计划](https://gitee.com/enterprises#nonprofit-plan)

[Gitee 持续集成](https://gitee.com/features/gitee-go)

[OpenAPI](https://gitee.com/api/v5/swagger)

[帮助文档](https://help.gitee.com/)

[在线自助服务](https://gitee.com/self_services)

[更新日志](https://gitee.com/help/articles/4378)

[关于我们](https://gitee.com/about_us)

[加入我们](https://www.oschina.net/news/131099/oschina-hiring)

[使用条款](https://gitee.com/terms)

[意见建议](https://gitee.com/oschina/git-osc/issues)

[合作伙伴](https://gitee.com/links.html)

![技术交流QQ群](https://cn-assets.gitee.com/assets/contact_qr-5e2c2a8da453396590e56a545bce4974.jpg)

技术交流QQ群

![微信服务号](https://cn-assets.gitee.com/assets/qrcode-weixin@2x-b74cc97a2ea80123ea53a737f709836d.png)

微信服务号

[ client@oschina.cn](mailto:%20client@oschina.cn)

[ 企业版在线使用：400-606-0201]()

[专业版私有部署：1367025230413352947997]()

![开放原子开源基金会](https://cn-assets.gitee.com/assets/logo-openatom-d083391cc8a54e283529f3fc11cc38ca.svg)[开放原子开源基金会](https://www.openatom.org/)合作代码托管平台

![违法和不良信息举报中心](https://cn-assets.gitee.com/assets/12377@2x-1aa42ed2d2256f82a61ecf57be1ec244.png)[违法和不良信息举报中心](https://12377.cn/)

[粤ICP备12009483号](http://beian.miit.gov.cn/)

[简 体](https://gitee.com/language/zh-CN) / [繁 體](https://gitee.com/language/zh-TW) / [English](https://gitee.com/language/en)

[×]()拖拽到此处完成下载

图片将完成下载

AIX智能下载器
