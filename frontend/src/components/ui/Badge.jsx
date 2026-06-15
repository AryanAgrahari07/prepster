export function Badge({ children, variant = 'default', className = '' }) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    success: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    outline: "border border-border text-foreground hover:bg-secondary"
  };

  return (
    <div className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </div>
  );
}
