import React from 'react';

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: string;
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  size = { xs: 'base', sm: 'lg', md: 'xl', lg: '2xl', xl: '3xl', '2xl': '4xl' },
  weight = 'normal',
  color = 'text-gray-900 dark:text-white',
  as: Component = 'p',
}) => {
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };

  const getResponsiveSize = () => {
    const sizeClasses = [];
    
    if (size.xs) sizeClasses.push(`text-${size.xs}`);
    if (size.sm) sizeClasses.push(`sm:text-${size.sm}`);
    if (size.md) sizeClasses.push(`md:text-${size.md}`);
    if (size.lg) sizeClasses.push(`lg:text-${size.lg}`);
    if (size.xl) sizeClasses.push(`xl:text-${size.xl}`);
    if (size['2xl']) sizeClasses.push(`2xl:text-${size['2xl']}`);
    
    return sizeClasses.join(' ');
  };

  const textClasses = `
    ${getResponsiveSize()}
    ${weightClasses[weight]}
    ${color}
    ${className}
  `.trim();

  return (
    <Component className={textClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveText;
