import React from 'react';

interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  margin?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  className = '',
  padding,
  margin,
  as: Component = 'div',
}) => {
  const getResponsiveClasses = (type: 'p' | 'm') => {
    const classes = [];
    const spacing = type === 'p' ? padding : margin;
    
    if (!spacing) return '';
    
    if (spacing.xs) classes.push(`${type}-${spacing.xs}`);
    if (spacing.sm) classes.push(`sm:${type}-${spacing.sm}`);
    if (spacing.md) classes.push(`md:${type}-${spacing.md}`);
    if (spacing.lg) classes.push(`lg:${type}-${spacing.lg}`);
    if (spacing.xl) classes.push(`xl:${type}-${spacing.xl}`);
    if (spacing['2xl']) classes.push(`2xl:${type}-${spacing['2xl']}`);
    
    return classes.join(' ');
  };

  const spacingClasses = `
    ${getResponsiveClasses('p')}
    ${getResponsiveClasses('m')}
    ${className}
  `.trim();

  return (
    <Component className={spacingClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveSpacing;
