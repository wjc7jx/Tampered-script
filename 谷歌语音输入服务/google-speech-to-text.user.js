// ==UserScript==
// @name         Google Speech to Text
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  使用谷歌语音转文字服务
// @author       Your Name
// @match        *://*/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.18.0/js/md5.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 创建一个按钮来启动语音识别
    const button = document.createElement('button');
    button.innerText = 'Start Speech to Text';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = 1000;
    document.body.appendChild(button);

    // 设置参数
    const appid = 'fe9e94c6';
    const apiKey = 'd454c2f5127a2d21975e77e034399ae6';
    const ts = Math.floor(Date.now() / 1000).toString();

    // 生成signa
    function generateSigna(appid, ts, apiKey) {
        const baseString = appid + ts;
        console.log('Base String:', baseString);
        const md5String = md5(baseString);
        console.log('MD5 String:', md5String);
        const hmacSha1String = CryptoJS.HmacSHA1(md5String, apiKey).toString(CryptoJS.enc.Base64);
        console.log('HmacSHA1 String:', hmacSha1String);
        return hmacSha1String;
    }

    const signa = generateSigna(appid, ts, apiKey);
    console.log('Signa:', signa);

    // 添加实时语音转写 API 调用
    const socket = new WebSocket(`wss://rtasr.xfyun.cn/v1/ws?appid=${appid}&ts=${ts}&signa=${signa}`);

    socket.onopen = function() {
        console.log('WebSocket连接已建立');
    };

    socket.onmessage = function(event) {
        console.log('WebSocket消息:', event.data);
        const data = JSON.parse(event.data);
        if (data.action === 'result' && data.code === '0') {
            const result = JSON.parse(data.data);
            const transcript = result.cn.st.rt[0].ws.map(word => word.cw[0].w).join('');
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                const start = activeElement.selectionStart;
                const end = activeElement.selectionEnd;
                activeElement.value = activeElement.value.substring(0, start) + transcript + activeElement.value.substring(end);
                activeElement.selectionStart = activeElement.selectionEnd = start + transcript.length;
            } else {
                alert('识别结果: ' + transcript);
            }
        } else if (data.action === 'error') {
            console.error('识别错误: ', data.desc);
            alert('识别错误: ' + data.desc);
        }
    };

    socket.onerror = function(event) {
        console.error('WebSocket错误: ', event);
        alert('WebSocket错误: ' + event.message);
    };

    socket.onclose = function() {
        console.log('WebSocket连接已关闭');
    };

    let mediaRecorder;
    let isRecording = false;

    button.addEventListener('click', () => {
        if (isRecording) {
            console.log('停止录音');
            mediaRecorder.stop();
            socket.send(JSON.stringify({ end: true }));
            button.innerText = 'Start Speech to Text';
            isRecording = false;
        } else {
            console.log('按钮点击，开始录音');
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorder = new MediaRecorder(stream);
                    mediaRecorder.ondataavailable = function(event) {
                        if (event.data.size > 0) {
                            console.log('发送音频数据:', event.data);
                            socket.send(event.data);
                        }
                    };
                    mediaRecorder.start(40); // 每40ms发送一次数据
                    button.innerText = 'Stop Speech to Text';
                    isRecording = true;
                })
                .catch(error => {
                    console.error('麦克风权限被拒绝: ', error);
                    alert('麦克风权限被拒绝，请检查浏览器权限设置。');
                });
        }
    });

    function startRecognition() {
        // 重新绑定点击事件
        button.onclick = () => {
            // ...existing code...
        };
    }
})();
    