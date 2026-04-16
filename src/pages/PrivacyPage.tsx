import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Shield, Lock, Eye, Database, Share2, UserX } from 'lucide-react';

export function PrivacyPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('seo.privacy.title');
    window.scrollTo(0, 0);
  }, [t]);

  const sections = [
    {
      icon: Database,
      title: 'المعلومات التي نجمعها',
      content: [
        'معلومات الحساب: الاسم، البريد الإلكتروني، كلمة المرور',
        'معلومات الملف الشخصي: الصورة، النبذة، الاهتمامات',
        'محتوى النقاشات: المشاركات، التعليقات، التصويتات',
        'بيانات الاستخدام: وقت الدخول، الصفحات المزورة، التفاعلات',
        'معلومات الجهاز: نوع المتصفح، نظام التشغيل، عنوان IP'
      ]
    },
    {
      icon: Eye,
      title: 'كيف نستخدم معلوماتك',
      content: [
        'تشغيل وتحسين المنصة وتجربة المستخدم',
        'توصية محتوى مناسب لاهتماماتك',
        'حماية الأمن ومنع الاحتيال والإساءة',
        'التواصل معك بخصوص تحديثات المنصة',
        'تحليل الاستخدام لتحسين خدماتنا',
        'الامتثال للالتزامات القانونية'
      ]
    },
    {
      icon: Lock,
      title: 'حماية بياناتك',
      content: [
        'تشفير كلمات المرور باستخدام bcrypt',
        'اتصال آمن HTTPS لجميع البيانات',
        'حدود معدل الطلبات لمنع الهجمات',
        'نسخ احتياطي منتظم للبيانات',
        'وصول محدود للموظفين فقط',
        'مراقبة أمنية مستمرة للنظام'
      ]
    },
    {
      icon: Share2,
      title: 'مشاركة المعلومات',
      content: [
        'لا نبيع بياناتك الشخصية لأي طرف ثالث',
        'المشاركة فقط مع مزودي الخدمات الأساسيين',
        'الإفصاح عند الضرورة القانونية فقط',
        'المحتوى العام مرئي لجميع المستخدمين',
        'يمكنك التحكم في خصوصية ملفك الشخصي'
      ]
    },
    {
      icon: UserX,
      title: 'حقوقك',
      content: [
        'الوصول إلى بياناتك الشخصية',
        'تصحيح المعلومات غير الدقيقة',
        'حذف حسابك وبياناتك (باستثناء المحتوى العام)',
        'تصدير بياناتك في أي وقت',
        'الاعتراض على معالجة بياناتك',
        'سحب الموافقة في أي وقت'
      ]
    },
    {
      icon: Shield,
      title: 'الاحتفاظ بالبيانات',
      content: [
        'نحتفظ بالبيانات طوال فترة استخدامك للمنصة',
        'بيانات النقاشات العامة قد تبقى متاحة بعد حذف الحساب',
        'يمكن طلب حذف كامل للبيانات عبر التواصل معنا',
        'سجلات الأمان تحتفظ لمدة 90 يوماً',
        'بيانات النسخ الاحتياطي تحتفظ لمدة 30 يوماً'
      ]
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
            <p className="text-muted-foreground">
              آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              في AporiaLab، نأخذ خصوصيتك على محمل الجد. هذه السياسة توضح كيفية جمعنا واستخدامنا وحمايتنا 
              لمعلوماتك الشخصية عند استخدامك لمنصتنا. باستخدامك لـ AporiaLab، فإنك توافق على الممارسات 
              الموضحة في هذه السياسة.
            </p>
          </div>

          {/* Sections */}
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
                <ul className="space-y-2 mr-14">
                  {section.content.map((item, i) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-muted-foreground mb-4">
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا على:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:privacy@aporialab.space" 
                className="text-primary hover:underline"
              >
                privacy@aporialab.space
              </a>
            </div>
          </div>

          {/* Changes Notice */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              قد نقوم بتحديث هذه السياسة من وقت لآخر. سنوضح أي تغييرات جوهرية على هذه الصفحة 
              وسنعلمك عبر البريد الإلكتروني.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
