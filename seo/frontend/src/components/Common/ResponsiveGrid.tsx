import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  as?: keyof JSX.IntrinsicElements;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4, '2xl': 4 },
  gap = 'md',
  as: Component = 'div',
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10',
    '2xl': 'gap-12',
  };

  const getGridCols = () => {
    const gridCols = [];
    
    if (cols.xs) gridCols.push(`grid-cols-${cols.xs}`);
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) gridCols.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return gridCols.join(' ');
  };

  const gridClasses = `
    grid
    ${getGridCols()}
    ${gapClasses[gap]}
    ${className}
  `.trim();

  return (
    <Component className={gridClasses}>
      {children}
    </Component>
  );
};

export default ResponsiveGrid;
