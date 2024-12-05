// ==UserScript==
// @name         重邮教务在线表格导出
// @namespace    http://jwzx.cqupt.edu.cn/
// @version      1.0
// @description  为重邮教务在线系统添加表格导出Excel功能
// @author       Your name
// @match        http://jwzx.cqupt.edu.cn/*
// @grant        GM_addStyle
// @require      https://unpkg.com/xlsx/dist/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    GM_addStyle(`
        .excel-export-btn {
            background-color: #1890ff;
            border: none;
            color: white;
            padding: 6px 12px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
            font-family: "Microsoft YaHei", sans-serif;
        }
        .excel-export-btn:hover {
            background-color: #40a9ff;
        }
    `);

    // 工具函数：将表格转换为Excel工作表
    function tableToSheet(table) {
        const rows = Array.from(table.rows);
        const data = rows.map(row => {
            return Array.from(row.cells).map(cell => cell.innerText.trim());
        });
        return XLSX.utils.aoa_to_sheet(data);
    }

    // 导出Excel函数
    function exportToExcel(table, index) {
        try {
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            const ws = tableToSheet(table);
            
            // 设置列宽
            const colWidths = Array.from(table.rows[0].cells).map(cell => {
                return {wch: Math.max(10, cell.innerText.length * 2)};
            });
            ws['!cols'] = colWidths;

            // 添加工作表到工作簿
            XLSX.utils.book_append_sheet(wb, ws, `表格${index + 1}`);

            // 生成文件名
            const fileName = `教务系统导出_${new Date().toLocaleDateString()}.xlsx`;

            // 保存文件
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败，请重试');
        }
    }

    // 主函数：添加导出按钮
    function addExportButtons() {
        const tables = document.getElementsByTagName('table');
        
        if (tables.length === 0) {
            return;
        }

        Array.from(tables).forEach((table, index) => {
            // 检查表格是否有效且未添加过导出按钮
            if (table.rows.length === 0 || table.hasAttribute('data-excel-export')) {
                return;
            }

            // 标记该表格已添加导出按钮
            table.setAttribute('data-excel-export', 'true');

            // 创建按钮容器
            const btnContainer = document.createElement('div');
            btnContainer.style.marginBottom = '10px';

            // 创建导出按钮
            const exportBtn = document.createElement('button');
            exportBtn.className = 'excel-export-btn';
            exportBtn.innerHTML = '导出Excel';
            exportBtn.onclick = () => exportToExcel(table, index);
            
            // 添加按钮到容器
            btnContainer.appendChild(exportBtn);
            
            // 将按钮容器插入到表格前面
            table.parentNode.insertBefore(btnContainer, table);
        });
    }

    // 等待页面加载完成后执行
    window.addEventListener('load', function() {
        addExportButtons();
    });

    // 优化后的 MutationObserver
    let observerTimeout;
    const observer = new MutationObserver(function(mutations) {
        // 使用防抖，避免频繁执行
        clearTimeout(observerTimeout);
        observerTimeout = setTimeout(() => {
            addExportButtons();
        }, 500);
    });

    // 限制观察范围，只观察文档主体
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 添加清理函数
    window.addEventListener('unload', function() {
        observer.disconnect();
        clearTimeout(observerTimeout);
    });
})(); 