import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    sections: [
      { label: t('footer.links.philosophy'), href: '/#discussions' },
      { label: t('footer.links.politics'), href: '/#discussions' },
      { label: t('footer.links.ethics'), href: '/#discussions' },
      { label: t('footer.links.sociology'), href: '/#discussions' },
    ],
    community: [
      { label: t('footer.links.circles'), href: '/#circles' },
      { label: t('footer.links.challenges'), href: '/#challenge' },
      { label: t('footer.links.leaders'), href: '/#leaders' },
      { label: t('footer.links.guidelines'), href: '/terms' },
    ],
    contact: [
      { label: t('footer.links.about'), href: '/about' },
      { label: t('footer.links.contact'), href: 'mailto:contact@aporialab.space' },
      { label: t('footer.links.privacy'), href: '/privacy' },
      { label: t('footer.links.terms'), href: '/terms' },
    ],
  };

  const isExternalLink = (href: string) => href.startsWith('mailto:') || href.startsWith('http');

  return (
    <footer className="relative pt-20 pb-8 border-t border-border/50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-background" />
              </div>
              <span className="text-xl font-bold gradient-text">{t('app.name')}</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t('footer.description')}
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:contact@aporialab.space" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>contact@aporialab.space</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+966 50 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="font-bold mb-4">{t('footer.sections.sections')}</h3>
            <ul className="space-y-3">
              {footerLinks.sections.map((link) => (
                <li key={link.label}>
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold mb-4">{t('footer.sections.community')}</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">{t('footer.sections.contact')}</h3>
            <ul className="space-y-3">
              {footerLinks.contact.map((link) => (
                <li key={link.label}>
                  {isExternalLink(link.href) ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.links.privacy')}
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.links.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
