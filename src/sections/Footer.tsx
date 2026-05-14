import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, MapPin, Linkedin, Instagram, Music2 } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // ============================================
  // ⚙️ CONFIGURATION — Update these as needed
  // ============================================
  const config = {
    email: 'hello@aporialab.space',
    social: {
      linkedin: 'https://www.linkedin.com/company/aporialab/',
      instagram: 'https://www.instagram.com/aporialab_official',
      tiktok: 'https://www.tiktok.com/@aporialab.space',
    },
  };
  // ============================================

  const footerLinks = {
    sections: [
      { label: t('footer.links.discussions'), href: '/discussions' },
      { label: t('footer.links.circles'), href: '/circles' },
      { label: t('footer.links.search'), href: '/search' },
      { label: t('footer.links.home'), href: '/' },
    ],
    community: [
      { label: t('footer.links.philosophyCircle'), href: '/circles' },
      { label: t('footer.links.leadersShort'), href: '/#leaders' },
      { label: t('footer.links.challenges'), href: '/#challenge' },
      { label: t('footer.links.guidelines'), href: '/terms' },
    ],
    contact: [
      { label: t('footer.links.about'), href: '/about' },
      { label: t('footer.links.contact'), href: `mailto:${config.email}` },
      { label: t('footer.links.privacy'), href: '/privacy' },
      { label: t('footer.links.terms'), href: '/terms' },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: config.social.linkedin, label: 'LinkedIn' },
    { icon: Instagram, href: config.social.instagram, label: 'Instagram' },
    { icon: Music2, href: config.social.tiktok, label: 'TikTok' },
  ];

  const isExternalLink = (href: string) => href.startsWith('mailto:') || href.startsWith('http');

  return (
    <footer className="relative pt-20 pb-8 border-t border-border/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-background" />
              </div>
              <span className="text-xl font-bold gradient-text">{t('app.name')}</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              {t('footer.description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a 
                href={`mailto:${config.email}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-amber-400 transition-colors group"
              >
                <Mail className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                <span dir="ltr">{config.email}</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{t('footer.location')}</span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-card/60 border border-border/50 grid place-items-center text-muted-foreground hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Sections Column */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">{t('footer.sections.platform')}</h3>
            <ul className="space-y-3">
              {footerLinks.sections.map((link) => (
                <li key={link.label}>
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">{t('footer.sections.community')}</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">{t('footer.sections.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.label}>
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyrightDash', { year: currentYear })}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors">
              {t('footer.links.privacyShort')}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors">
              {t('footer.links.termsShort')}
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors">
              {t('footer.links.aboutShort')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
