import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  ...(isGitHubPages
    ? {
        output: 'export' as const,
        assetPrefix: '/openai-navier-stokes-results',
        trailingSlash: true,
      }
    : {}),
};

export default withMDX(nextConfig);
