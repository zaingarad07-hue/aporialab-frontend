import { useTranslation } from 'react-i18next';

interface StanceBarProps {
  stats?: { pro: number; con: number; neutral: number };
}

export function StanceBar({ stats }: StanceBarProps) {
  const { t } = useTranslation();
  if (!stats) return null;
  const total = stats.pro + stats.con + stats.neutral;
  if (total === 0) return null;

  const proPercent = (stats.pro / total) * 100;
  const conPercent = (stats.con / total) * 100;
  const neutralPercent = (stats.neutral / total) * 100;

  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-secondary/30">
      {proPercent > 0 && (
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${proPercent}%` }}
          title={`${t('discussionsPage.stance.pro')}: ${stats.pro}`}
        />
      )}
      {neutralPercent > 0 && (
        <div
          className="bg-slate-400 transition-all"
          style={{ width: `${neutralPercent}%` }}
          title={`${t('discussionsPage.stance.neutral')}: ${stats.neutral}`}
        />
      )}
      {conPercent > 0 && (
        <div
          className="bg-red-500 transition-all"
          style={{ width: `${conPercent}%` }}
          title={`${t('discussionsPage.stance.con')}: ${stats.con}`}
        />
      )}
    </div>
  );
}
