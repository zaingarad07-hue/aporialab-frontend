import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Lock,
  Globe,
  Loader2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Circle } from '@/services/api';

export function Circles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCircles();
        if (response.success) {
          // Show only first 6 circles in landing (sorted by members)
          const sorted = (response.circles || []).sort((a, b) => (b.members || 0) - (a.members || 0));
          setCircles(sorted.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to fetch circles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCircles();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="circles" className="relative py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      {/* Subtle decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">المجتمعات الفكرية</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">الدوائر الفكرية</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            مجتمعات متخصصة حسب الاهتمام · انضم لتشارك في نقاشات أعمق
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل الدوائر...</p>
          </div>
        )}

        {/* Empty State (shouldn't happen since we seeded 8) */}
        {!isLoading && circles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد دوائر حالياً</p>
          </div>
        )}

        {/* Circles Grid */}
        {!isLoading && circles.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {circles.map((circle) => {
              const color = circle.color || '#daa520';
              
              return (
                <motion.div
                  key={circle._id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -8,
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                  }}
                  className="group relative flex flex-col rounded-2xl bg-card border overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: `${color}40`,
                  }}
                >
                  {/* Top accent bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-0.5 transition-all opacity-50 group-hover:opacity-100"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  />

                  {/* Gradient Background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 70%)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 p-6 flex flex-col h-full">
                    {/* Privacy Badge + Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        whileHover={{ 
                          rotate: [0, -10, 10, -5, 0],
                          scale: 1.15,
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-xl grid place-items-center text-2xl"
                        style={{ 
                          background: `${color}15`,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        {circle.icon || '🌐'}
                      </motion.div>
                      
                      {circle.isPrivate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                          <Lock className="w-2.5 h-2.5" />
                          خاصة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 text-[10px]">
                          <Globe className="w-2.5 h-2.5" />
                          عامة
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-base md:text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {circle.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-2 leading-relaxed">
                      {circle.description || ''}
                    </p>

                    {/* Tags */}
                    {circle.tags && circle.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {circle.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/40 text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Members + Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                        <Users className="w-3.5 h-3.5" />
                        <span>{(circle.members || 0).toLocaleString()}</span>
                        <span className="text-[10px]">عضو</span>
                      </div>
                      
                      <Link to="/circles">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs"
                          style={{ color }}
                        >
                          استكشف
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CTA: View all circles */}
        {!isLoading && circles.length >= 6 && (
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/circles">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button 
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                >
                  <Sparkles className="w-4 h-4" />
                  اكتشف الدوائر الـ 8 جميعها
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
