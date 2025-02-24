// ==UserScript==
// @name         遮挡对分易练习题答案
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  遮挡对分易在线练习答案，点击显示/隐藏
// @author       Your name
// @match        https://www.duifene.com/_Paper/PC/UserPaperView.aspx*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .answer-hidden {
            display: none !important;
        }
        .toggle-button {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 10px 20px;
            background-color: #1890ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .toggle-button:hover {
            background-color: #40a9ff;
        }
        .pdf-button {
            right: 150px;
        }
    `;
    document.head.appendChild(style);

    // 创建切换按钮
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-button';
    toggleButton.textContent = '显示答案';
    toggleButton.style.right = '280px';  // 调整位置
    document.body.appendChild(toggleButton);

    // 创建带答案的PDF按钮
    const pdfWithAnswerButton = document.createElement('button');
    pdfWithAnswerButton.className = 'toggle-button pdf-button';
    pdfWithAnswerButton.textContent = '导出带答案PDF';
    pdfWithAnswerButton.style.right = '150px';
    document.body.appendChild(pdfWithAnswerButton);

    // 创建不带答案的PDF按钮
    const pdfNoAnswerButton = document.createElement('button');
    pdfNoAnswerButton.className = 'toggle-button pdf-button';
    pdfNoAnswerButton.textContent = '导出无答案PDF';
    pdfNoAnswerButton.style.right = '20px';
    document.body.appendChild(pdfNoAnswerButton);

    let answersHidden = true;

    // 隐藏答案的函数
    function hideAnswers() {
        const answers = document.querySelectorAll('.subject-explain.form-horizontal');
        answers.forEach(answer => {
            answer.classList.add('answer-hidden');
        });
    }

    // 显示答案的函数
    function showAnswers() {
        const answers = document.querySelectorAll('.subject-explain.form-horizontal');
        answers.forEach(answer => {
            answer.classList.remove('answer-hidden');
        });
    }

    // 监听按钮点击事件
    toggleButton.addEventListener('click', () => {
        answersHidden = !answersHidden;
        if (answersHidden) {
            hideAnswers();
            toggleButton.textContent = '显示答案';
        } else {
            showAnswers();
            toggleButton.textContent = '隐藏答案';
        }
    });

    // 添加PDF导出功能（带答案版本）
    pdfWithAnswerButton.addEventListener('click', () => {
        const content = document.querySelector("#form1 > div.container.body-default > div.col-md-9.paper-page > div > div");
        if (!content) {
            alert('未找到题目内容！');
            return;
        }

        // 临时显示所有答案
        const wasHidden = answersHidden;
        if (wasHidden) {
            const answers = document.querySelectorAll('.subject-explain.form-horizontal');
            answers.forEach(answer => {
                answer.classList.remove('answer-hidden');
            });
        }

        const opt = {
            margin: 10,
            filename: '试题（带答案）.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(content).save().then(() => {
            // 恢复原来的状态
            if (wasHidden) {
                const answers = document.querySelectorAll('.subject-explain.form-horizontal');
                answers.forEach(answer => {
                    answer.classList.add('answer-hidden');
                });
            }
        });
    });

    // 添加PDF导出功能（无答案版本）
    pdfNoAnswerButton.addEventListener('click', () => {
        const content = document.querySelector("#form1 > div.container.body-default > div.col-md-9.paper-page > div > div");
        if (!content) {
            alert('未找到题目内容！');
            return;
        }

        // 确保所有答案都被隐藏
        const wasHidden = answersHidden;
        if (!wasHidden) {
            const answers = document.querySelectorAll('.subject-explain.form-horizontal');
            answers.forEach(answer => {
                answer.classList.add('answer-hidden');
            });
        }

        const opt = {
            margin: 10,
            filename: '试题（无答案）.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(content).save().then(() => {
            // 恢复原来的状态
            if (!wasHidden) {
                const answers = document.querySelectorAll('.subject-explain.form-horizontal');
                answers.forEach(answer => {
                    answer.classList.remove('answer-hidden');
                });
            }
        });
    });

    // 创建一个观察器来处理动态加载的内容
    const observer = new MutationObserver((mutations) => {
        const answers = document.querySelectorAll('.subject-explain.form-horizontal');
        answers.forEach(answer => {
            if (!answer.classList.contains('answer-hidden') && answersHidden) {
                answer.classList.add('answer-hidden');
            }
        });
    });

    // 配置观察器
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初始化时隐藏答案
    setTimeout(hideAnswers, 1000);
})();
