// init.mjs
import fs from 'fs';

// ⚠️ 改成你的真实子域名（末尾不要带斜杠）
const DOMAIN = 'https://bili.averybleu.top';

const imgDir = './static/bilibili';
fs.mkdirSync(imgDir, { recursive: true });

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Referer': 'https://www.bilibili.com/'
};

// 只拉取官方核心常用的前三个包：id=1(默认小黄脸), id=2(热词系列), id=3(tv小电视)
const apiUrl = 'https://api.bilibili.com/x/emote/package?business=reply&ids=1,2,3';

console.log('⏳ 正在获取 B 站官方核心表情包...');
const res = await fetch(apiUrl, { headers });
const json = await res.json();

const owo = {};
let count = 1;

for (const pack of (json.data?.packages || [])) {
  const groupName = pack.text; // 官方原名，如“默认”、“热词系列”、“tv_小电视”
  owo[groupName] = { type: "image", container: [] };

  console.log(`\n📦 正在下载【${groupName}】（共 ${pack.emote.length} 个）...`);

  for (const item of pack.emote) {
    const rawName = item.text.replace(/[\[\]]/g, '');
    const fileName = `bili_${count}.png`; // 纯英文数字文件名，杜绝转码 404
    const filePath = `${imgDir}/${fileName}`;

    const imgRes = await fetch(item.url, { headers });
    if (imgRes.ok) {
      fs.writeFileSync(filePath, Buffer.from(await imgRes.arrayBuffer()));
      process.stdout.write('.');

      owo[groupName].container.push({
        icon: `<img src="${DOMAIN}/static/bilibili/${fileName}">`,
        text: `bili_${rawName}`
      });
      count++;
    }
  }
}

fs.writeFileSync('./_headers', '/*\n  Access-Control-Allow-Origin: *\n  Cache-Control: public, max-age=31536000\n');
fs.writeFileSync('./owo.json', JSON.stringify(owo));
console.log(`\n\n🎉 官方核心表情下载完毕！共收录 ${count - 1} 个表情！`);