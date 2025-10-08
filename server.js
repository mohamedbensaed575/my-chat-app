// 1. استدعاء المكتبات
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// مهم جداً للنشر: يجب تحديد cors للسماح بالاتصال من أي موقع على الإنترنت
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// 2. تحديد المنفذ (للنشر: استخدم PORT من البيئة أو 3000 افتراضياً)
const PORT = process.env.PORT || 3000;

// 3. تحديد المسار الأساسي (إرسال صفحة الواجهة)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); 
});

// 4. استماع الخادم للاتصالات وتوجيه الرسائل الخاصة
io.on('connection', (socket) => {
  // 1. تسجيل الـ ID الخاص بالمستخدم المتصل حالياً
  const senderID = socket.id;
  console.log('مستخدم جديد متصل. ID الخاص به هو: ' + senderID);
  
  // نرسل الـ ID إلى المستخدم حتى يعرفه
  socket.emit('my_id', senderID);

  // 2. استقبال الرسائل الخاصة
  socket.on('private_message', (data) => {
    const recipientID = data.recipient;
    const message = data.message;
    
    // محاولة إرسال الرسالة للمستلم المحدد
    io.to(recipientID).emit('private_message', {
      sender: senderID,
      message: message
    });
    
    // أيضاً نرسلها للمرسل حتى يراها في نافذته
    socket.emit('private_message', {
      sender: senderID,
      message: message
    });
    
    console.log(`رسالة من ${senderID} إلى ${recipientID}: ${message}`);
  });

  // 3. عند انقطاع الاتصال
  socket.on('disconnect', () => {
    console.log('المستخدم ' + senderID + ' انقطع اتصاله.');
  });
});

// 5. تشغيل الخادم
server.listen(PORT, () => {
  console.log(`الخادم جاهز! يمكن زيارته على المنفذ: ${PORT}`);
});