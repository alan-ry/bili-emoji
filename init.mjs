// init.mjs
import fs from 'fs';

// ⚠️ 1. 把这里改成你准备绑定的子域名（末尾不要带斜杠）
const DOMAIN = 'https://bili.averybleu.top';

const imgDir = './static/bilibili';
fs.mkdirSync(imgDir, { recursive: true });

console.log('⏳ 正在连接 B 站免登录公开接口获取表情列表...');

// 换用免登录的 package 接口（ids=1,2,3 分别对应：默认小黄脸、热词系列、小电视）
const apiUrl = 'https://api.bilibili.com/x/emote/package?business=reply&ids=1,2,3';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/'
};

const res = await fetch(apiUrl, { headers });
const json = await res.json();

if (!json.data || !json.data.packages) {
  console.error('❌ 接口返回异常，B 站返回内容为：', json);
  process.exit(1);
}

const owo = {};

for (const pack of json.data.packages) {
  console.log(`📦 正在下载【${pack.text}】（共 ${pack.emote.length} 个）...`);
  owo[pack.text] = { type: 'image', container: [] };

  for (const item of pack.emote) {
    // 去掉 [doge] 的中括号作为文件名
    const name = item.text.replace(/[\[\]\/\\:*?"<>|\s]/g, '');
    const filePath = `${imgDir}/${name}.png`;

    if (!fs.existsSync(filePath)) {
      const imgRes = await fetch(item.url, { headers });
      fs.writeFileSync(filePath, Buffer.from(await imgRes.arrayBuffer()));
      process.stdout.write('.'); // 打印小点显示下载进度
    }

    owo[pack.text].container.push({
      icon: `<img src="${DOMAIN}/static/bilibili/${encodeURIComponent(name)}.png">`,
      text: `bili_${name}`
    });
  }
  console.log(`\n✅ 【${pack.text}】下载完成！`);
}

// 自动生成跨域许可文件 _headers 和最终的 owo.json
fs.writeFileSync('./_headers', '/*\n  Access-Control-Allow-Origin: *\n  Cache-Control: public, max-age=31536000\n');
fs.writeFileSync('./owo.json', JSON.stringify(owo));
console.log('🎉 全部下载并生成完毕！现在可以直接执行 git push 上传了。');