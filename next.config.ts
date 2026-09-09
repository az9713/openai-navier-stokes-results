import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

export default withMDX(nextConfig);
