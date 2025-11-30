interface AvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  name = "",
  size = "md",
  className = "",
}: AvatarProps) {
  const getInitials = () => {
    if (!name) return "??";
    // Get first two characters of the name
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-11 w-11 text-base",
    lg: "h-16 w-16 text-xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-full bg-olive-500 text-white font-semibold`}
    >
      {getInitials()}
    </div>
  );
}
