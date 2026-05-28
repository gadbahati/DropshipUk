const Logo = ({ showSubtitle = true }: { showSubtitle?: boolean }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
        <span className="bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Dropship
        </span>
        <span className="mx-1">🇬🇧</span>
        <span className="text-[hsl(var(--brand-red))]">UK</span>
      </h1>
      {showSubtitle && (
        <p className="text-sm text-muted-foreground mt-1">
          Global Reach, Local Speed
        </p>
      )}
    </div>
  );
};

export default Logo;
