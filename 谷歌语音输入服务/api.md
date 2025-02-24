# 实时语音转写 API 文档

## [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E)接口说明

实时语音转写（Real-time ASR）基于深度全序列卷积神经网络框架，通过 WebSocket 协议，建立应用与语言转写核心引擎的长连接，开发者可实现将连续的音频流内容，实时识别返回对应的文字流内容。
支持的音频格式： 采样率为16K，采样深度为16bit的pcm\_s16le音频

点击跳转[**在线咨询**](https://xfyun.sobot.com/chat/pc/v2/index.html?sysnum=1f851a5acb6e4f408a3e3e5487750951&channelid=28)

## [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8E%A5%E5%8F%A3demo)接口Demo

**示例demo**请点击 **[这里](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E8%B0%83%E7%94%A8%E7%A4%BA%E4%BE%8B)** 下载。
目前仅提供部分开发语言的demo，其他语言请参照下方接口文档进行开发。
也欢迎热心的开发者到 [讯飞开放平台社区](http://bbs.xfyun.cn/) 分享你们的demo。

## [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8E%A5%E5%8F%A3%E8%A6%81%E6%B1%82)接口要求

集成实时语音转写API时，需按照以下要求。


| 内容     | 说明                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 请求协议 | ws[s] (为提高安全性，强烈推荐wss)                                                                                                     |
| 请求地址 | ws[s]: //rtasr.xfyun.cn/v1/ws?{请求参数}<br/>*注：服务器IP不固定，为保证您的接口稳定，请勿通过指定IP的方式调用接口，使用域名方式调用* |
| 接口鉴权 | 签名机制，详见[数字签名](https://www.xfyun.cn/doc/asr/rtasr/API.html#signa%E7%94%9F%E6%88%90)                                         |
| 字符编码 | UTF-8                                                                                                                                 |
| 响应格式 | 统一采用JSON格式                                                                                                                      |
| 开发语言 | 任意，只要可以向讯飞云服务发起WebSocket请求的均可                                                                                     |
| 音频属性 | 采样率16k、位长16bit、单声道                                                                                                          |
| 音频格式 | pcm                                                                                                                                   |
| 数据发送 | 建议音频流每40ms发送1280字节                                                                                                          |
| 语言种类 | 中文普通话、中英混合识别、英文，小语种以及中文方言可以到控制台-实时语音转写-方言/语种处添加试用或购买                                 |

## [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8%E6%B5%81%E7%A8%8B)接口调用流程

*注：* 若需配置IP白名单，请前往控制台。IP白名单规则请参照 [IP白名单](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E7%99%BD%E5%90%8D%E5%8D%95)。

实时语音转写接口调用包括两个阶段：握手阶段和实时通信阶段。

### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8F%A1%E6%89%8B%E9%98%B6%E6%AE%B5)握手阶段

接口地址

```text
    ws://rtasr.xfyun.cn/v1/ws?{请求参数}
    或
    wss://rtasr.xfyun.cn/v1/ws?{请求参数}
```

参数格式

```text
    key1=value1&key2=value2…（key和value都需要进行urlencode）
```

参数说明


| 参数          | 类型   | 必须 | 说明                                                                                                                                                                                                                                                                                           | 示例                                                                                                                                                                                  |
| ------------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appid         | string | 是   | 讯飞开放平台应用ID                                                                                                                                                                                                                                                                             | 595f23df                                                                                                                                                                              |
| ts            | string | 是   | 当前时间戳，从1970年1月1日0点0分0秒开始到现在的秒数                                                                                                                                                                                                                                            | 1512041814                                                                                                                                                                            |
| signa         | string | 是   | 加密数字签名（基于HMACSHA1算法）                                                                                                                                                                                                                                                               | IrrzsJeOFk1NGfJHW6SkHUoN9CU=                                                                                                                                                          |
| lang          | string | 否   | 实时语音转写语种，不传默认为中文                                                                                                                                                                                                                                                               | 语种类型：中文、中英混合识别：cn；英文：en；小语种及方言可到控制台-实时语音转写-方言/语种处添加，添加后会显示该方言/语种参数值。传参示例如："lang=en"<br/>若未授权无法使用会报错10110 |
| transType     | string | 否   | normal表示普通翻译，默认值normal；                                                                                                                                                                                                                                                             | 例如：transType="normal"<br/>注意：需控制台开通翻译功能                                                                                                                               |
| transStrategy | int    | 否   | 策略1，转写的vad结果直接送去翻译；<br/>策略2，返回中间过程中的结果；<br/>策略3，按照结束性标点拆分转写结果请求翻译；<br/>建议使用策略2                                                                                                                                                         | 例如：transStrategy=2<br/>注意：需控制台开通翻译功能                                                                                                                                  |
| targetLang    | String | 否   | 目标翻译语种：控制把源语言转换成什么类型的语言；<br/>请注意类似英文转成法语必须以中文为过渡语言，即英-中-法，暂不支持不含中文语种之间的直接转换；<br/>中文：cn<br/>英文：en<br/>日语：ja<br/>韩语：ko<br/>俄语：ru<br/>法语：fr<br/>西班牙语：es<br/>越南语：vi<br/>广东话：cn\_cantonese<br/> | 例如：targetLang="en"<br/>如果使用中文实时翻译为英文传参示例如下：<br/>"&lang=cn&transType=normal&transStrategy=2&targetLang=en"<br/>注意：需控制台开通翻译功能                       |
| punc          | string | 否   | 标点过滤控制，默认返回标点，punc=0会过滤结果中的标点                                                                                                                                                                                                                                           | 0                                                                                                                                                                                     |
| pd            | string | 否   | 垂直领域个性化参数:<br/>法院: court<br/>教育: edu<br/>金融: finance<br/>医疗: medical<br/>科技: tech<br/>运营商: isp<br/>政府: gov<br/>电商: ecom<br/>军事: mil<br/>企业: com<br/>生活: life<br/>汽车: car                                                                                     | 设置示例：pd="edu"<br/>参数pd为非必须设置，不设置参数默认为通用                                                                                                                       |
| vadMdn        | int    | 否   | 远近场切换，不传此参数或传1代表远场，传2代表近场                                                                                                                                                                                                                                               | 设置示例：vadMdn=2                                                                                                                                                                    |
| roleType      | int    | 否   | 是否开角色分离，默认不开启，传2开启<br/>(效果持续优化中)                                                                                                                                                                                                                                       | 设置示例：roleType=2                                                                                                                                                                  |
| engLangType   | int    | 否   | 语言识别模式，默认为模式1中英文模式：<br/>1：自动中英文模式<br/>2：中文模式，可能包含少量英文<br/>4：纯中文模式，不包含英文                                                                                                                                                                    | 设置示例：engLangType=4                                                                                                                                                               |

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#signa%E7%94%9F%E6%88%90)signa生成

1.获取baseString，baseString由appid和当前时间戳ts拼接而成，假如appid为595f23df，ts为1512041814，则baseString为

> 595f23df1512041814

2.对baseString进行MD5，假如baseString为上一步生成的595f23df1512041814，MD5之后则为

> 0829d4012497c14a30e7e72aeebe565e

3.以apiKey为key对MD5之后的baseString进行HmacSHA1加密，然后再对加密后的字符串进行base64编码。
假如apiKey为d9f4aa7ea6d94faca62cd88a28fd5234，MD5之后的baseString为上一步生成的0829d4012497c14a30e7e72aeebe565e，
则加密之后再进行base64编码得到的signa为

> IrrzsJeOFk1NGfJHW6SkHUoN9CU=

备注：

* apiKey：接口密钥，在应用中添加实时语音转写服务时自动生成，调用方注意保管；
* signa的生成公式：HmacSHA1(MD5(appid + ts), api\_key)，具体的生成方法详见【[调用示例](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E8%B0%83%E7%94%A8%E7%A4%BA%E4%BE%8B)】；

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E8%AF%B7%E6%B1%82%E7%A4%BA%E4%BE%8B)请求示例

```text
	ws://rtasr.xfyun.cn/v1/ws?appid=595f23df&ts=1512041814&signa=IrrzsJeOFk1NGfJHW6SkHUoN9CU=&pd=edu
```

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E8%BF%94%E5%9B%9E%E5%80%BC)返回值

结果格式为json，字段说明如下：


| 参数   | 类型   | 说明                                                                                            |
| ------ | ------ | ----------------------------------------------------------------------------------------------- |
| action | string | 结果标识，started:握手，result:结果，error:异常                                                 |
| code   | string | 结果码(具体见[错误码](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E9%94%99%E8%AF%AF%E7%A0%81)) |
| data   | string | 结果数据                                                                                        |
| desc   | string | 描述                                                                                            |
| sid    | string | 会话ID                                                                                          |

其中sid字段主要用于DEBUG追查问题，如果出现问题，可以提供sid帮助确认问题。

> 成功

```json
	{
	  
	    "action":"started",
		"code":"0",
		"data":"",
		"desc":"success",
		"sid":"rta0000000a@ch312c0e3f63609f0900"
	}
```

> 失败

```json
	{
	    "action":"error",
		"code":"10110",
		"data":"",
		"desc":"invalid authorization|illegal signa",
		"sid":"rta0000000b@ch312c0e3f65f09f0900"
	}
```

### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E5%AE%9E%E6%97%B6%E9%80%9A%E4%BF%A1%E9%98%B6%E6%AE%B5)实时通信阶段

握手成功后，进入实时通信阶段，此时客户端的主动操作有两种：上传数据和上传结束标识，被动操作有两种：接收转写结果和错误

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E4%B8%8A%E4%BC%A0%E6%95%B0%E6%8D%AE)上传数据

在实时转写过程中，客户端不断构造binary message发送到服务端，内容是音频的二进制数据。此操作的频率影响到文字结果展现的实时性。

注意：

1.建议音频流每40ms发送1280字节，发送过快可能导致引擎出错； 2.音频发送间隔超时时间为15秒，超时服务端报错并主动断开连接。

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E4%B8%8A%E4%BC%A0%E7%BB%93%E6%9D%9F%E6%A0%87%E5%BF%97)上传结束标志

音频数据上传完成后，客户端需发送一个特殊的binary message到服务端作为结束标识，内容是：

```json
 	{"end": true}
```

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8E%A5%E6%94%B6%E8%BD%AC%E5%86%99%E7%BB%93%E6%9E%9C)接收转写结果

交互过程中，服务端不断返回 text message （转写结果） 到客户端。当所有结果发送完毕后，服务端断开连接，交互结束。

结果示例：

```json
	{
    	    "action":"result",
    	    "code":"0",
    		"data":"{\"cn\":{\"st\":{\"bg\":\"820\",\"ed\":\"0\",\"rt\":[{\"ws\":[{\"cw\":[{\"w\":\"啊\",\"wp\":\"n\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"喂\",\"wp\":\"n\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"！\",\"wp\":\"p\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"你好\",\"wp\":\"n\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"！\",\"wp\":\"p\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"我\",\"wp\":\"n\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"是\",\"wp\":\"n\"}],\"wb\":0,\"we\":0},{\"cw\":[{\"w\":\"上\",\"wp\":\"n\"}],\"wb\":0,\"we\":0}]}],\"type\":\"1\"}},\"seg_id\":5}\n",
    		"desc":"success",
    		"sid":"rta0000000e@ch312c0e3f6bcc9f0900"
	}
```

其中data为转写结果的json字符串

```json
	data：
		{
		    "cn":{
		        "st":{
		            "bg":"820",
		            "ed":"0",
		            "rt":[{
	                    "ws":[{
                            "cw":[{
                                "w":"啊",
                                "wp":"n"
                            }],
                            "wb":0,
                            "we":0
                        },{
                        	"cw":[{
                                "w":"喂",
                                "wp":"n"
                            }],
                            "wb":0,
                            "we":0
                        },{
                            "cw":[{
                                "w":"！",
                                "wp":"p"
                            }],
                            "wb":0,
                            "we":0
                        },{
                            "cw":[{
                                "w":"你好",
                                "wp":"n"
                            }],
                            "wb":0,
                            "we":0
                        },{
                            "cw":[{
                            	"w":"！",
								"wp":"p"
                            }],
                            "wb":0,
                            "we":0
						},{
                            "cw":[{
                                "w":"我",
                                "wp":"n"
                            }],
	                        "wb":0,
	                        "we":0
                    	},{
                        	"cw":[{
                                "w":"是",
                                "wp":"n"
                            }],
	                        "wb":0,
	                        "we":0
	                    },{
	                        "cw":[{
	                                "w":"上",
	                                "wp":"n"
	                        }],
	                        "wb":0,
	                        "we":0
                    	}]
	                }],
		            "type":"1"
		        }
		    },
		    "seg_id":5
		}
```

结果示例（开启翻译功能）：

```json
{
  "action": "result",
  "code": "0",
  "data": "{\"biz\":\"trans\",\"dst\":\" the bright moonlight in front of the bed, suspected to be frost on the ground, looked up at the bright moon, bowed his head and thought of his hometown.\",\"isEnd\":false,\"segId\":12,\"src\":\"床前明月光，疑是地上霜，举头望明月，低头思故乡。\",\"type\":0,\"bg\":0,\"ed\":4770}",
  "desc": "success",
  "sid": "rta00004fda@dx1f1c148be1d9000100"
}
```

其中data为转写结果的json字符串（开启翻译功能）：

```json
{
  "biz": "trans",
  "dst": " the bright moonlight in front of the bed, suspected to be frost on the ground, looked up at the bright moon, bowed his head and thought of his hometown.",
  "isEnd": false,
  "segId": 12,
  "src": "床前明月光，疑是地上霜，举头望明月，低头思故乡。",
  "type": 0,
  "bg": 0,
  "ed": 4770
}
```

转写结果data字段说明如下：


| 字段    | 含义                                                                                                                                                                                                                                                                                 | 描述                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| bg      | 句子在整段语音中的开始时间，单位毫秒(ms)                                                                                                                                                                                                                                             | 中间结果的bg为准确值                 |
| ed      | 句子在整段语音中的结束时间，单位毫秒(ms)                                                                                                                                                                                                                                             | 中间结果的ed为0                      |
| w       | 词识别结果                                                                                                                                                                                                                                                                           |                                      |
| wp      | 词标识                                                                                                                                                                                                                                                                               | n-普通词；s-顺滑词（语气词）；p-标点 |
| wb      | 词在本句中的开始时间，单位是帧，1帧=10ms<br/>即词在整段语音中的开始时间为(bg+wb\*10)ms                                                                                                                                                                                               | 中间结果的 wb 为 0                   |
| we      | 词在本句中的结束时间，单位是帧，1帧=10ms<br/>即词在整段语音中的结束时间为(bg+we\*10)ms                                                                                                                                                                                               | 中间结果的 we 为 0                   |
| type    | 结果类型标识                                                                                                                                                                                                                                                                         | 0-最终结果；1-中间结果               |
| seg\_id | 转写结果序号                                                                                                                                                                                                                                                                         | 从0开始                              |
| biz     | 业务标识字段，开启翻译功能后值为 trans                                                                                                                                                                                                                                               | 翻译功能标识                         |
| src     | 送翻译的原始文本                                                                                                                                                                                                                                                                     | 音频对应的识别文本                   |
| dst     | 目标语种翻译文本结果                                                                                                                                                                                                                                                                 | 与原始文本src对应                    |
| isEnd   | 翻译结束标识                                                                                                                                                                                                                                                                         | 如果为 true，标识翻译结果已推送完成  |
| rl      | 1、分离的角色编号，需开启角色分离的功能才返回对应的分离角色编号。<br/>2、角色编号从1开始计算。<br/>3、该字段只有在角色分离功能打开时出现。该值只有角色切换时才会变化，其余时值为0。例如角色A开始说话rl=1，后面角色A说话rl都是0，等到角色B开始说话时，rl=2，角色B继续说话rl又变回0 。 | 取值正整数                           |

#### [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E6%8E%A5%E6%94%B6%E9%94%99%E8%AF%AF%E4%BF%A1%E6%81%AF)接收错误信息

交互过程中，在服务端出现异常而中断服务时（如会话超时），会将异常信息以 text message 形式返回给客户端并关闭连接。

## [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E7%99%BD%E5%90%8D%E5%8D%95)白名单

在调用该业务接口时

* 若关闭IP白名单，接口认为IP不限，不会校验IP。
* 若打开IP白名单，则服务端会检查调用方IP是否在讯飞开放平台配置的IP白名单中，对于没有配置到白名单中的IP发来的请求，服务端会拒绝服务。

IP白名单规则

* IP白名单，在 控制台-我的应用-相应服务的应用管理卡片上 编辑，保存后五分钟左右生效；
* 不同Appid的不同服务都需要分别设置IP白名单；
* IP白名单需设置为外网IP，请勿设置局域网IP。
* 如果服务器返回结果如下所示(illegal client\_ip)，则表示由于未配置IP白名单或配置有误，服务端拒绝服务。

```json
{
	"action": "error",
	"code": "10105",
	"data": "",
	"desc": "illegal access|illegal client_ip: xx.xx.xx.xx",
	"sid": "rta..."
}
```

## [#](https://www.xfyun.cn/doc/asr/rtasr/API.html#%E9%94%99%E8%AF%AF%E7%A0%81)错误码


| 错误码 | 描述                    | 说明                  | 处理方式                              |
| ------ | ----------------------- | --------------------- | ------------------------------------- |
| 0      | success                 | 成功                  |                                       |
| 10105  | illegal access          | 没有权限              | 检查apiKey，ip，ts等授权参数是否正确  |
| 10106  | invalid parameter       | 无效参数              | 上传必要的参数， 检查参数格式以及编码 |
| 10107  | illegal parameter       | 非法参数值            | 检查参数值是否超过范围或不符合要求    |
| 10110  | no license              | 无授权许可            | 检查参数值是否超过范围或不符合要求    |
| 10700  | engine error            | 引擎错误              | 提供接口返回值，向服务提供商反馈      |
| 10202  | websocket connect error | websocket连接错误     | 检查网络是否正常                      |
| 10204  | websocket write error   | 服务端websocket写错误 | 检查网络是否正常，向服务提供商反馈    |
| 10205  | websocket read error    | 服务端websocket读错误 | 检查网络是否正常，向服务提供商反馈    |
| 16003  | basic component error   | 基础组件异常          | 重试或向服务提供商反馈                |
| 10800  | over max connect limit  | 超过授权的连接数      | 确认连接数是否超过授权的连接数        |
