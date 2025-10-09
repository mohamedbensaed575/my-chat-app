// 1. استيراد الحزم الضرورية
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // إضافة مكتبة المسارات

// تحميل المتغيرات السرية من ملف .env
require('dotenv').config();

// تهيئة Gemini باستخدام المفتاح السري المجاني
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

const app = express();
// عند النشر على Render، يجب أن نستخدم البورت الذي يحدده Render (process.env.PORT)
// أو نستخدم البورت الافتراضي 3000 إذا كنا نعمل محلياً (localhost)
const port = process.env.PORT || 3000;

// 2. تفعيل الميزات
app.use(bodyParser.json());
app.use(cors()); 

// **الخطوة الحاسمة:** تعريف المسار لملفات الواجهة الثابتة (index.html, style.css, script.js)
// هذا يضمن أن Render يمكنه العثور على ملفات الواجهة وخدمتها
app.use(express.static(path.join(__dirname))); 

// 3. مسار API الجديد: /api/ask
app.post('/api/ask', async (req, res) => {
    // 🛑 فحص المفتاح السري (يجب إضافته في إعدادات Render كمتغير بيئة)
    if (!process.env.GEMINI_API_KEY) {
        // هذا الرد سيظهر إذا لم يتم إضافة المفتاح في إعدادات Render
        return res.status(500).json({ error: 'لم يتم العثور على المفتاح السري (GEMINI_API_KEY). تأكد من إضافته كـ Environment Variable في Render.' });
    }

    try {
        const { question } = req.body;

        // **تعريف الشخصية الليبية (System Instruction)**
        const systemInstruction = 
            `أنت نموذج ذكاء اصطناعي. مهمتك هي الإجابة على جميع أسئلة المستخدم بلهجة ليبية طرابلسية خالصة. 
            استخدم عبارات شعبية مثل "يا وليدي"، "حيّك"، "شن جوّك"، "كويس"، "بكل"، "كُني"، "هكي"، "أمانة"، "خلاص"، "والله صحيت"، إلخ. 
            تأكد أن ردك ودود ومناسب للثقافة الليبية.`;
        
        // إرسال الطلب إلى نموذج Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${systemInstruction}\n\nسؤال المستخدم: ${question}` }]
                }
            ]
        });

        const aiResponse = response.text;
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error fetching AI response:', error.message);
        res.status(500).json({ error: `صار خطأ يا وليدي في الاتصال بالذكاء الاصطناعي. ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`✅ LibyanGPT Server running on port ${port}`);
});
