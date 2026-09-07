import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        panel: 'var(--color-panel)',
        subtle: 'var(--color-subtle)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-highlight': 'var(--color-border-highlight)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        ruby: {
          DEFAULT: 'var(--color-ruby)',
          hover: 'var(--color-ruby-hover)',
          glow: 'var(--color-ruby-glow)',
          subtle: 'var(--color-ruby-subtle)',
        },
        status: {
          compliant: 'var(--color-status-compliant)',
          'compliant-bg': 'var(--color-status-compliant-bg)',
          warning: 'var(--color-status-warning)',
          'warning-bg': 'var(--color-status-warning-bg)',
          danger: 'var(--color-status-danger)',
          'danger-bg': 'var(--color-status-danger-bg)',
          draft: 'var(--color-status-draft)',
          'draft-bg': 'var(--color-status-draft-bg)',
        },
      },
      boxShadow: {
        glass: 'var(--glass-shadow)',
      },
      backdropBlur: {
        glass: 'var(--glass-backdrop-blur)',
      },
    },
  },
  plugins: [],
};

export default config;
