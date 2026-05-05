import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Sidebar } from '../Sidebar';
import { LoginDialog } from '../components/LoginDialog';
import { JoinDialog } from '../components/JoinDialog';
import { CreateDiscussionDialog } from '../components/CreateDiscussionDialog';
import { useAuth } from '../context/AuthContext';
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, MessageSquare, Award } from 'lucide-react';

export function TermsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const supportEmail = 'support@aporialab.space';

  useEffect(() => {
    document.title = t('seo.terms.title') || 'شروط الاستخدام · AporiaLab';
    window.scrollTo(0, 0);
  }, [t]);

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  const sections = [
    {
      icon: CheckCircle,
      title: 'قبول الشروط',
      content: `باستخدامك لمنصة AporiaLab، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام المنصة. 
نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني المسجل.

يجب أن تكون قد بلغت سن 13 عاماً على الأقل لاستخدام المنصة. للمستخدمين تحت 18 عاماً، يجب الحصول على موافقة ولي الأمر.`
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
• استخدام المنصة لأغراض تجارية دون إذن مكتوب
• نشر محتوى يخالف القيم الإسلامية والثقافة العربية`
    },
    {
      icon: MessageSquare,
      title: 'محتوى المستخدم',
      content: `أنت المسؤول عن المحتوى الذي تنشره على المنصة. بنشرك للمحتوى:

• تمنحنا ترخيصاً غير حصري لاستخدام وعرض وتوزيع محتواك على المنصة
• تؤكد أنك تمتلك حقوق نشر المحتوى أو لديك إذن باستخدامه
• تفهم أن المحتوى العام متاح للجميع وقد يتم أرشفته
• توافق على أننا قد نزيل أي محتوى يخالف هذه الشروط
• تتحمل مسؤولية كاملة عن صحة المعلومات المنشورة
• تفهم أن الردود والتفاعلات تعكس آراء أصحابها فقط`
    },
    {
      icon: Award,
      title: 'نظام السمعة والتقييم',
      content: `يستخدم AporiaLab نظام سمعة لتشجيع المساهمات الجادة:

• النقاط تُكتسب من إنشاء نقاشات وتلقّي تفاعلات إيجابية
• المستويات: مبتدئ، صاعد، محترف، نخبة، أسطورة
• شارة "مفكر مؤسس" للأعضاء الأوائل
• يُحظر التلاعب بنظام السمعة (التصويت الذاتي، حسابات وهمية)
• قد نلغي نقاطاً أو نوقف حسابات تستخدم أساليب احتيالية
• النقاط ليس لها قيمة نقدية ولا يمكن تحويلها أو بيعها
• حقنا الكامل في تعديل النظام أو إلغاء النقاط لأي سبب`
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
• التلاعب بنظام السمعة أو التصويت
• إساءة استخدام نظام التقارير لمضايقة الآخرين
• استخدام بوتات أو أدوات آلية دون إذن`
    },
    {
      icon: XCircle,
      title: 'الإيقاف والحظر',
      content: `نحتفظ بالحق في:

• تعليق أو إلغاء حسابك فوراً دون إشعار مسبق عند الانتهاكات الجسيمة
• إزالة أي محتوى يخالف هذه الشروط
• حظر الوصول من عناوين IP معينة
• الإبلاغ عن الأنشطة غير القانونية للسلطات المختصة في دولة الإمارات
• اتخاذ إجراءات قانونية عند الضرورة
• فرض عقوبات تدريجية: تحذير، تعليق مؤقت، حظر دائم

يمكنك الاعتراض على القرارات عبر التواصل معنا خلال 30 يوماً.`
    },
    {
      icon: FileText,
      title: 'حقوق الملكية الفكرية',
      content: `• المنصة ومحتواها الأصلي محمي بموجب قوانين حقوق النشر في دولة الإمارات والقوانين الدولية
• شعار AporiaLab وعلامتها التجارية مملوكة لنا حصرياً
• لا يجوز نسخ أو توزيع أو تعديل المنصة دون إذن مكتوب
• أنت تحتفظ بحقوق ملكيتك الفكرية في محتواك الأصلي
• نحترم حقوق الملكية الفكرية للآخرين ونتعامل مع إشعارات الإزالة وفقاً للقانون
• اقتباس النقاشات يجب أن يكون مع ذكر المصدر ورابط الأصل`
    }
  ];

  const additionalClauses = [
    {
      title: 'إخلاء المسؤولية',
      content: 'المنصة مقدمة "كما هي" دون أي ضمانات صريحة أو ضمنية. نحن غير مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام المنصة. المحتوى المنشور يعبر عن آراء أصحابه فقط ولا يمثل موقف AporiaLab.'
    },
    {
      title: 'التعويض',
      content: 'أنت توافق على تعويضنا والدفاع عنا ضد أي مطالبات أو دعاوى أو نفقات (بما فيها أتعاب المحاماة) ناتجة عن استخدامك للمنصة أو انتهاكك لهذه الشروط أو حقوق الآخرين.'
    },
    {
      title: 'القانون الساري والاختصاص القضائي',
      content: 'تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة وإمارة دبي. أي نزاعات تُحل ودياً أولاً، وفي حال تعذر ذلك، تختص محاكم دبي بالنظر فيها حصرياً.'
    },
    {
      title: 'فصل البنود',
      content: 'إذا أصبح أي بند من هذه الشروط غير صالح أو غير قابل للتنفيذ، يبقى الباقي ساري المفعول. سنستبدل البند غير الصالح ببند آخر يحقق نفس الهدف الأصلي قدر الإمكان.'
    },
    {
      title: 'التراخيص والتنازل',
      content: 'عدم ممارسة أي حق من حقوقنا لا يعني التنازل عنه. يجب أن تكون أي تعديلات على هذه الشروط كتابية وموقعة منا. التنازل عن أي بند لا يعني التنازل عن البنود الأخرى.'
    },
    {
      title: 'القوة القاهرة',
      content: 'لا نتحمل مسؤولية أي تأخير أو فشل في الأداء بسبب ظروف خارجة عن إرادتنا، مثل الكوارث الطبيعية، الحروب، أو أعطال البنية التحتية للإنترنت.'
    }
  ];

  return (
    <>
      <Sidebar onCreateClick={handleCreateClick} />
      
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />
      
      <main className="md:mr-[4.5rem] pt-24 pb-16 min-h-screen" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6">
              <FileText className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">شروط الاستخدام</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-AE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              مرحباً بك في <strong className="text-amber-400">AporiaLab</strong>. هذه الشروط والأحكام 
              تحدد القواعد والمتطلبات لاستخدام منصتنا. يرجى قراءتها بعناية قبل استخدام المنصة. 
              باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط ضمن إطار قوانين دولة الإمارات العربية المتحدة.
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div 
                  key={section.title}
                  className="p-5 md:p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold">{section.title}</h2>
                  </div>
                  <div className="mr-2 md:mr-14 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Clauses */}
          <div className="mt-12">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
              <span className="gradient-text">بنود إضافية</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalClauses.map((clause) => (
                <div 
                  key={clause.title}
                  className="p-4 rounded-xl bg-secondary/20 border border-border/30 backdrop-blur-sm"
                >
                  <h3 className="font-bold mb-2 text-amber-400 text-sm">{clause.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{clause.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <h2 className="text-xl font-bold mb-4 text-amber-400">تواصل معنا</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              إذا كان لديك أي أسئلة حول شروط الاستخدام، أو تريد الإبلاغ عن انتهاك، 
              أو طلب توضيح قانوني، يمكنك التواصل معنا على:
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-2 text-amber-400 hover:underline font-medium"
                dir="ltr"
              >
                {supportEmail}
              </a>
              <p className="text-xs text-muted-foreground">
                سنرد على استفساراتك خلال 5 أيام عمل
              </p>
            </div>
          </div>

          {/* Jurisdiction Notice */}
          <div className="mt-6 p-4 rounded-xl bg-card/30 border border-border/40 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              ⚖️ تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة
              <br />
              📍 AporiaLab — مقرها دبي، الإمارات العربية المتحدة
            </p>
          </div>

          {/* Agreement Notice */}
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-400 text-center leading-relaxed font-medium">
              باستخدامك لمنصة AporiaLab، فإنك تقر بأنك قرأت وفهمت ووافقت على هذه الشروط والأحكام.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
