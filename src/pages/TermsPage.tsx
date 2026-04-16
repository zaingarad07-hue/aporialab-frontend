import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export function TermsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('seo.terms.title');
    window.scrollTo(0, 0);
  }, [t]);

  const sections = [
    {
      icon: CheckCircle,
      title: 'قبول الشروط',
      content: `باستخدامك لمنصة AporiaLab، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
      إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة. 
      نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية.`
    },
    {
      icon: Scale,
      title: 'الاستخدام المقبول',
      content: `يجب استخدام المنصة بشكل قانوني وأخلاقي. يُحظر استخدام المنصة لـ:
      
      • نشر محتوى غير قانوني أو ضار أو مسيء
      • التحرش أو التهديد أو التمييز ضد الآخرين
      • انتحال شخصية الآخرين أو التظاهر بأنك ممثل لجهة ما
      • نشر محتوى مخالف لحقوق الملكية الفكرية
      • محاولة اختراق أو تعطيل المنصة
      • جمع معلومات المستخدمين دون إذن
      • استخدام المنصة لأغراض تجارية دون إذن`
    },
    {
      icon: MessageSquare,
      title: 'محتوى المستخدم',
      content: `أنت المسؤول عن المحتوى الذي تنشره على المنصة. بنشرك للمحتوى:
      
      • تمنحنا ترخيصاً غير حصري لاستخدام وعرض وتوزيع محتواك
      • تؤكد أنك تمتلك حقوق نشر المحتوى أو لديك إذن باستخدامه
      • تفهم أن المحتوى العام متاح للجميع وقد يتم أرشفته
      • توافق على أننا قد نزيل أي محتوى يخالف هذه الشروط`
    },
    {
      icon: AlertTriangle,
      title: 'السلوك الممنوع',
      content: `يُحظر بشكل قاطع:
      
      • التطرف أو التحريض على العنف أو الكراهية
      • المحتوى الإباحي أو الجنسي الصريح
      • التحرش الجنسي أو الجنساني
      • التهديدات بالعنف أو الأذى
      • نشر معلومات شخصية خاصة بالآخرين (doxing)
      • البريد العشوائي أو المحتوى الترويجي غير المرغوب فيه
      • التلاعب بنظام السمعة أو التصويت`
    },
    {
      icon: XCircle,
      title: 'الإيقاف والحظر',
      content: `نحتفظ بالحق في:
      
      • تعليق أو إلغاء حسابك فوراً دون إشعار مسبق
      • إزالة أي محتوى يخالف هذه الشروط
      • حظر الوصول من عناوين IP معينة
      • الإبلاغ عن الأنشطة غير القانونية للسلطات المختصة
      • اتخاذ إجراءات قانونية عند الضرورة
      
      يمكنك الاعتراض على القرارات عبر التواصل معنا.`
    },
    {
      icon: FileText,
      title: 'حقوق الملكية الفكرية',
      content: `• المنصة ومحتواها الأصلي محمي بموجب قوانين حقوق النشر
      • شعار AporiaLab وعلامتها التجارية مملوكة لنا
      • لا يجوز نسخ أو توزيع أو تعديل المنصة دون إذن
      • أنت تحتفظ بحقوق ملكيتك الفكرية في محتواك
      • نحترم حقوق الملكية الفكرية للآخرين ونتعامل مع إشعارات الإزالة`
    }
  ];

  const additionalClauses = [
    {
      title: 'إخلاء المسؤولية',
      content: 'المنصة مقدمة "كما هي" دون أي ضمانات. نحن غير مسؤولين عن أي أضرار ناتجة عن استخدام المنصة. المحتوى المنشور يعبر عن آراء أصحابه فقط.'
    },
    {
      title: 'التعويض',
      content: 'أنت توافق على تعويضنا والدفاع عنا ضد أي مطالبات ناتجة عن استخدامك للمنصة أو انتهاكك لهذه الشروط.'
    },
    {
      title: 'القانون الساري',
      content: 'تخضع هذه الشروط لقوانين المملكة العربية السعودية. أي نزاعات تُحل في المحاكم المختصة في الرياض.'
    },
    {
      title: 'فصل البنود',
      content: 'إذا أصبح أي بند من هذه الشروط غير صالح، يبقى الباقي ساري المفعول.'
    },
    {
      title: 'التراخيص',
      content: 'عدم ممارسة أي حق من حقوقنا لا يعني التنازل عنه. يجب أن تكون أي تعديلات على هذه الشروط كتابية وموقعة منا.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar onLoginClick={() => {}} onJoinClick={() => {}} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">شروط الاستخدام</h1>
            <p className="text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              مرحباً بك في AporiaLab. هذه الشروط والأحكام تحدد القواعد والمتطلبات لاستخدام منصتنا. 
              يرجى قراءتها بعناية قبل استخدام المنصة. باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط.
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div 
                key={section.title}
                className="p-6 rounded-2xl bg-card/50 border border-border/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <div className="mr-14 text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Clauses */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">بنود إضافية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {additionalClauses.map((clause) => (
                <div 
                  key={clause.title}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <h3 className="font-bold mb-2">{clause.title}</h3>
                  <p className="text-sm text-muted-foreground">{clause.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-muted-foreground mb-4">
              إذا كان لديك أي أسئلة حول شروط الاستخدام، يمكنك التواصل معنا على:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:legal@aporialab.space" 
                className="text-primary hover:underline"
              >
                legal@aporialab.space
              </a>
            </div>
          </div>

          {/* Agreement Notice */}
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-400 text-center">
              باستخدامك لمنصة AporiaLab، فإنك تقر بأنك قرأت وفهمت وتوافق على هذه الشروط والأحكام.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
