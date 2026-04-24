import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowRight, Compass } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'الصفحة غير موجودة - AporiaLab';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
      
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 60%)'
        }}
      />

      {/* Floating circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Big 404 */}
        <div className="mb-8 relative">
          <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none gradient-text opacity-90 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-16 h-16 md:w-24 md:h-24 text-primary/30 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          ضاعت البوصلة الفكرية
        </h2>
        
        <p className="text-lg text-muted-foreground mb-2 max-w-lg mx-auto leading-relaxed">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        
        <p className="text-sm text-muted-foreground/70 mb-8 max-w-md mx-auto">
          ربما المسار غير صحيح، أو أن النقاش قد حُذف، أو أن الرابط قديم
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 min-w-[180px]"
          >
            <Home className="w-4 h-4" />
            العودة للرئيسية
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 min-w-[180px]"
          >
            <ArrowRight className="w-4 h-4" />
            الرجوع للخلف
          </Button>
        </div>

        {/* Suggested Links */}
        <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Search className="w-4 h-4" />
            <span className="text-sm">اقتراحات</span>
          </div>
          
          <div className="space-y-3 text-right">
            <Link 
              to="/" 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground">
                تصفّح النقاشات الفكرية
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            
            <Link 
              to="/about" 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground">
                تعرّف على AporiaLab
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>

        {/* Easter egg */}
        <p className="text-xs text-muted-foreground/50 mt-12 italic">
          "الضلال ليس نهاية الطريق، بل بدايته" — مجهول
        </p>
      </div>
    </div>
  );
}
