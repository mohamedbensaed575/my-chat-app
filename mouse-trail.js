// هذا الكود يستخدم وظائف P5.js للرسم على Canvas.

let trail = []; // مصفوفة لتخزين إحداثيات النقاط التي يمر بها الماوس

function setup() {
    // إنشاء مساحة رسم (Canvas) تغطي الشاشة بالكامل
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0); // وضعها في أعلى اليسار
    canvas.style('z-index', '-1'); // وضعها خلف عناصر الدردشة (مهم جداً!)
    background(255); 
    noFill(); // لا نملأ النقاط
    strokeWeight(2); // سمك خط النقاط
    // إعداد نظام الألوان (HSL) للحصول على تدرج قوس قزح
    colorMode(HSL, 360, 360, 360, 360); 
}

function draw() {
    // محو خفيف للخلفية (Opacity: 10) ليخلق تأثير التلاشي الناعم
    background(255, 10); 

    // أضف إحداثيات الماوس إلى المصفوفة
    trail.push({ x: mouseX, y: mouseY });

    // إذا زاد عدد النقاط عن 50 (طول المسار)، قم بإزالة أقدم نقطة
    if (trail.length > 50) {
        trail.shift();
    }

    // ارسم المسار
    for (let i = 0; i < trail.length; i++) {
        // حساب قيمة اللون (Hue) لتطبيق تدرج قوس قزح
        let hue = map(i, 0, trail.length, 0, 360); 
        
        // تطبيق اللون
        stroke(hue, 300, 300, 300); 

        // ارسم الخط الذي يربط النقطة الحالية بالتي قبلها
        if (i > 0) {
            line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
        }
    }
}

// تعديل حجم الـ Canvas عند تغيير حجم النافذة (مهم للشاشات المختلفة)
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}