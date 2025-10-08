// 1. تعريف المكتبات
const app = require('express')();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);

// 2. تحديد المنفذ (Port)
// يستخدم Render متغيرات البيئة، لكن نستخدم 3000 للتجربة المحلية
const PORT = process.env.PORT || 3000;

// هذا لكي يقوم الخادم بتخزين الاسم المؤقت لكل مستخدم (ID: Name)
var users = {}; 

// 3. تحديد المسار الأساسي (إرسال صفحة الواجهة)
app.get('/', (req, res) => {
    // هذا السطر يحل المشكلة ويعرض ملف index.html
    res.sendFile(__dirname + '/index.html'); 
});

// 4. استماع الخادم للاتصالات
io.on('connection', (socket) => {
    console.log(`مستخدم جديد متصل بالـ ID: ${socket.id}`);

    // استقبال اسم المستخدم لأول مرة
    socket.on('new user', function(data) {
        users[socket.id] = data; // تخزين الاسم بناءً على ID الاتصال
        console.log('تم تسجيل اسم المستخدم: ' + data);
        
        // **ميزة الغرف والخاص:** الانضمام إلى غرفة باسم المستخدم لتمكين الرسائل الخاصة
        socket.join(data); 
        
        // إشعار المستخدمين الجدد (رسالة عامة)
        io.emit('chat message', { msg: `${data} انضم للدردشة!`, user: 'SERVER' });
    });

    // استقبال رسائل الدردشة مع الاسم والغرفة/المرسل إليه
    socket.on('chat message', (data) => {
        
        // 1. إذا كانت الرسالة موجهة لغرفة أو مستخدم محدد (Private/Room)
        if (data.room && data.room !== '') {
            // إرسال الرسالة للغرفة/المستخدم فقط باستخدام io.to()
            io.to(data.room).emit('chat message', { 
                msg: data.msg + ` (خاص أو في غرفة ${data.room})`, 
                user: data.user
            });
            console.log(`رسالة من ${data.user} إلى الغرفة/الخاص: ${data.room}`);
        } 
        
        // 2. إذا كانت رسالة عامة (Public)
        else {
            // إرسال الرسالة للجميع (Public)
            io.emit('chat message', { msg: data.msg, user: data.user }); 
            console.log(`رسالة عامة من ${data.user}: ${data.msg}`);
        }
    });

    // عند فصل الاتصال
    socket.on('disconnect', () => {
        // رسالة تنبيه للمستخدمين بأن فلاناً غادر
        if (users[socket.id]) {
            const disconnectedUser = users[socket.id];
            io.emit('chat message', { msg: `${disconnectedUser} غادر الدردشة!`, user: 'SERVER' });
            delete users[socket.id]; 
            console.log(`المستخدم ${disconnectedUser} قطع الاتصال`);
        }
    });
});


// 5. استماع الخادم للاتصالات
server.listen(PORT, () => {
    console.log(`الخادم جاهز! يستمع على منفذ ${PORT}`);
});