interface FeatureCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

const FeatureCard = ({ icon, title, subtitle, onClick }: FeatureCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="bg-card rounded-xl p-6 text-center shadow-sm border-l-4 border-primary hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
};

export default FeatureCard;
