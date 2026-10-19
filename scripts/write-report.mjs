import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const report=JSON.parse(await fs.readFile(path.join(root,'verification/report.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'public/assets-manifest.json'),'utf8'));
const retina=JSON.parse(await fs.readFile(path.join(root,'verification/retina-check.json'),'utf8'));
const max=Math.max(...report.comparisons.map(c=>c.differencePercent));
const rows=report.comparisons.map(c=>`| ${c.viewport.width} × ${c.viewport.height} | ${{top:'首屏',scroll:'滚动 750px',bottom:'底部'}[c.position]} | ${c.differentPixels} | ${c.differencePercent.toFixed(8)}% |`).join('\n');
const text=`# Meshy 首页视觉比对报告

结论：${report.passed?'通过':'未通过'}。4 个视口、12 张截图的最大不同像素比例为 **${max.toFixed(8)}%**。单张截图最多有 ${Math.max(...report.comparisons.map(c=>c.differentPixels))} 个有效不同像素。

测试对象是实际构建后的静态页面，原站参考为 https://www.meshy.ai/zh/discover 。原站首页内容固定为抓取时初始的 20 张卡片；轮播使用第一张，动画停用，鼠标移出内容区。

## 截图结果

| 视口 | 页面位置 | 不同像素数 | 不同像素比例 |
| --- | --- | ---: | ---: |
${rows}

比较使用相同的 Google Chrome、中文语言、深色主题和 DPR=1。Pixelmatch 颜色阈值为 0.1，忽略抗锯齿边缘；通过标准为不同像素比例不高于 ${report.tolerancePercent}%。这个结果描述所列视口与固定页面状态，不代表任意浏览器或变化中的实时内容都逐位相同。

## 完整性

- 脚本错误：${report.errors.length}。
- 失败的资源请求：${report.failedResponses.length}。
- 外部资源请求：${report.remoteRequests.length}。
- 资源清单：${manifest.files.length} 个本地文件，含 ${manifest.files.filter(f=>f.file.endsWith('.css')).length} 份原始样式表、${manifest.files.filter(f=>f.file.endsWith('.woff2')).length} 个字体文件及图片、图标、高分屏变体。
- 原始页面的 ${manifest.inlineSVGs} 处 SVG 实例保留在页面结构中，包含 Logo、导航、生成区和卡片图标。
- DPR=2 下检查 ${retina.map(r=>r.width).join('、')}px 共 ${retina.length} 种宽度：20 张卡片均存在，无缺图、无横向溢出、无脚本错误、无外部请求。
- npm run build 成功，dist/ 可独立静态托管。

## 查看证据

开发服务器运行时，打开 [拖动叠图比对](http://localhost:5173/verification/) 逐张检查。

- [原始 JSON 报告](report.json)
- [高分屏检查](retina-check.json)
- [1440px 原站首屏](../reference/original-1440.png)
- [1440px 复刻首屏](local-1440.png)
- [1440px 首屏差异图](diff-1440.png)

首屏、滚动和底部的其他原图、本地图和差异图均在相应目录中。
`;
await fs.writeFile(path.join(root,'verification/REPORT.md'),text);
console.log('Verification report written. Maximum difference:',max.toFixed(8)+'%');
