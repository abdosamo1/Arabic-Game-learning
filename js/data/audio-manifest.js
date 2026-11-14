/* تسجيلات المعلّمة. فاضي = قراءة آلية.
   لإضافة تسجيل: حط الملف في assets/audio وأضف سطر هنا بنفس المعرّف.

   المعرّفات:
     harf-<id>      اسم الحرف مع ال (مثال: harf-ba = «الباء»)
     name-<id>      اسم الحرف لوحده (name-ba = «باء»)
     word-<id>      الكلمة (word-batta = «بطة»)
     q-where        «أين حرف»
     q-first        «بأيّ حرف تبدأ كلمة»
     q-pic          «أيّ صورة تبدأ بحرف»
     this-is        «هذا حرف»
     retry          «حاول مرة أخرى»
     syl-<حرف>-<حركة>   المقطع (syl-ba-fatha = «بَ»)
     haraka-<id>         اسم الحركة (haraka-fatha = «الفتحة»)
     praise-1..4    «أحسنت» «ممتاز» «رائع» «صحيح»

   معرّفات الحروف والكلمات موجودة في js/data/letters.js */
window.DF = window.DF || {};
window.DF.AUDIO_FILES = {
  // 'harf-ba': 'assets/audio/harf-ba.mp3',
};
