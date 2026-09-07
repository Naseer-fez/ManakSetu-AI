import { beforeEach } from 'vitest';

beforeEach((): void => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
