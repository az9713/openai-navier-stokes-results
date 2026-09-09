'use client';

import dynamic from 'next/dynamic';

const VortexDemo = dynamic(() => import('./vortex-demo'), {
  ssr: false,
  loading: () => <div className="demo-frame" style={{ minHeight: 520 }} aria-label="Loading vortex model" />,
});

export default VortexDemo;
