import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
  pageKey: string;
}

const PageTransition: React.FC<Props> = ({ 
  children, pageKey 
}) => {
  const [visible, setVisible] = useState(false);
  const [prevKey, setPrevKey] = useState(pageKey);

  useEffect(() => {
    if (pageKey !== prevKey) {
      setVisible(false);
      const t = setTimeout(() => {
        setPrevKey(pageKey);
        setVisible(true);
      }, 200);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(
        () => setVisible(true), 50
      );
      return () => clearTimeout(t);
    }
  }, [pageKey]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible 
        ? 'translateY(0) scale(1)' 
        : 'translateY(12px) scale(0.98)',
      transition: `
        opacity 0.35s cubic-bezier(0.23,1,0.32,1),
        transform 0.35s cubic-bezier(0.23,1,0.32,1)
      `,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {children}
    </div>
  );
};

export default PageTransition;
