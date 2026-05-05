import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Sidebar } from '../Sidebar';
import { LoginDialog } from '../components/LoginDialog';
import { JoinDialog } from '../components/JoinDialog';
import { CreateDiscussionDialog } from '../components/CreateDiscussionDialog';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Eye, Database, Share2, UserX, Globe } from 'lucide-react';

export function PrivacyPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const contactEmail = 'hello@aporialab.space';

  useEffect(() => {
    document.title = t('seo.privacy.title') || 'سياسة الخصوصية · AporiaLab';
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
      icon: Database,
      title: 'المعلومات التي نجمعها',
      content: [
        'معلومات الحساب: الاسم، البريد الإلكتروني، كلمة المرور (مشفّرة)',
        'معلومات Google OAuth: عند التسجيل عبر Google',
        'معلومات الملف الشخصي: الصورة، النبذة، الاهتمامات',
        'محتوى النقاشات: المشاركات، التعليقات، التصويتات، الردود',
        'بيانات الاستخدام: وقت الدخول، الصفحات المزورة، التفاعلات',
        'معلومات الجهاز: نوع المتصفح، نظام التشغيل، عنوان IP',
      ],
    },
    {
      icon: Eye,
      title: 'كيف نستخدم معلوماتك',
      content: [
        'تشغيل وتحسين المنصة وتجربة المستخدم',
        'توصية محتوى ودوائر مناسبة لاهتماماتك',
        'حساب نقاط السمعة والتقدم في النظام',
        'حماية الأمن ومنع الاحتيال والإساءة',
        'التواصل معك بخصوص تحديثات المنصة المهمة',
        'تحليل الاستخدام لتحسين خدماتنا',
        'الامتثال للالتزامات القانونية في دولة الإمارات',
      ],
    },
    {
      icon: Lock,
      title: 'حماية بياناتك',
      content: [
        'تشفير كلمات المرور باستخدام bcrypt (معيار صناعي)',
        'اتصال آمن HTTPS لجميع البيانات المنقولة',
        'JWT tokens لتأمين الجلسات',
        'حدود معدل الطلبات لمنع الهجمات',
        'نسخ احتياطي منتظم للبيانات على MongoDB Atlas',
        'وصول محدود للموظفين المخوّلين فقط',
        'مراقبة أمنية مستمرة للنظام',
      ],
    },
    {
      icon: Share2,
      title: 'مشاركة المعلومات',
      content: [
        'لا نبيع بياناتك الشخصية لأي طرف ثالث، أبداً',
        'نشارك فقط مع مزودي خدمات أساسيين (مثل Vercel للاستضافة)',
        'الإفصاح عند الضرورة القانونية فقط (أمر قضائي)',
        'المحتوى العام (نقاشات/تعليقات) مرئي لجميع المستخدمين',
        'يمكنك التحكم في خصوصية ملفك الشخصي',
        'لا نستخدم بياناتك لإعلانات مستهدفة',
      ],
    },
    {
      icon: UserX,
      title: 'حقوقك (GDPR وقانون الإمارات)',
      content: [
        'الحق في الوصول: طلب نسخة من بياناتك في أي وقت',
        'الحق في التصحيح: تعديل المعلومات غير الدقيقة',
        'الحق في الحذف: حذف حسابك وبياناتك بالكامل',
        'الحق في النقل: تصدير بياناتك بصيغة قياسية',
        'الحق في الاعتراض: رفض معالجة بياناتك',
        'الحق في سحب الموافقة: في أي وقت ودون مبرر',
        'الحق في الشكوى: للجهات التنظيمية المختصة',
      ],
    },
    {
      icon: Shield,
      title: 'الاحتفاظ بالبيانات',
      content: [
        'نحتفظ بالبيانات طوال فترة استخدامك للمنصة',
        'بيانات النقاشات العامة قد تبقى متاحة بعد حذف الحساب (مع إخفاء هويتك)',
        'يمكن طلب حذف كامل للبيانات عبر التواصل معنا',
        'سجلات الأمان تُحفظ لمدة 90 يوماً',
        'بيانات النسخ الاحتياطي تُحفظ لمدة 30 يوماً',
        'بعد حذف الحساب: معالجة فورية، تأكيد خلال 30 يوماً',
      ],
    },
    {
      icon: Globe,
      title: 'الكوكيز والتتبع',
      content: [
        'نستخدم كوكيز ضرورية لتشغيل المنصة (تسجيل الدخول، التفضيلات)',
        'كوكيز التحليل: لفهم كيفية استخدام المنصة (Vercel Analytics)',
        'لا نستخدم كوكيز إعلانية من أطراف ثالثة',
        'يمكنك إيقاف الكوكيز من إعدادات المتصفح',
        'تخزين محلي (LocalStorage) لحفظ تفضيلاتك',
        'بعض الوظائف قد لا تعمل بدون الكوكيز الضرورية',
      ],
    },
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
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">سياسة الخصوصية</span>
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
              في <strong className="text-amber-400">AporiaLab</strong>، نأخذ خصوصيتك على محمل الجد. 
              هذه السياسة توضح كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا. 
              نحن ملتزمون بأعلى معايير حماية البيانات وفقاً لقوانين دولة الإمارات العربية المتحدة 
              والمعايير الدولية مثل GDPR. باستخدامك لـ AporiaLab، فإنك توافق على الممارسات الموضحة في هذه السياسة.
            </p>
          </div>

          {/* Sections */}
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
                  <ul className="space-y-2 mr-2 md:mr-14">
                    {section.content.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-400 mt-1.5 flex-shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <h2 className="text-xl font-bold mb-4 text-amber-400">تواصل معنا</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، أو تريد ممارسة أحد حقوقك المذكورة أعلاه، 
              يمكنك التواصل معنا على:
            </p>
            <div className="flex flex-col gap-3">
              <a 
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 text-amber-400 hover:underline font-medium"
                dir="ltr"
              >
                {contactEmail}
              </a>
              <p className="text-xs text-muted-foreground">
                سنرد على استفساراتك خلال 5 أيام عمل
              </p>
            </div>
          </div>

          {/* Jurisdiction Notice */}
          <div className="mt-6 p-4 rounded-xl bg-card/30 border border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              📍 AporiaLab — مقرها دبي، الإمارات العربية المتحدة
            </p>
          </div>

          {/* Changes Notice */}
          <div className="mt-6 text-center text-xs text-muted-foreground/80">
            <p className="leading-relaxed">
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنوضح أي تغييرات جوهرية على هذه الصفحة 
              وسنعلمك عبر البريد الإلكتروني المسجّل عند إجراء تغييرات مهمة.
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
