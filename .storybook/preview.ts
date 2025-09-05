import type { Preview } from '@storybook/web-components';
import { Application } from '@hotwired/stimulus';
import '../src/styles/main.css';

// Setup Stimulus for stories
const application = Application.start();
(window as any).Stimulus = application;

// Add Google Fonts to Storybook
const link1 = document.createElement('link');
link1.rel = 'preconnect';
link1.href = 'https://fonts.googleapis.com';
document.head.appendChild(link1);

const link2 = document.createElement('link');
link2.rel = 'preconnect';
link2.href = 'https://fonts.gstatic.com';
link2.crossOrigin = 'anonymous';
document.head.appendChild(link2);

const link3 = document.createElement('link');
link3.rel = 'stylesheet';
link3.href = 'https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&family=Homemade+Apple&display=swap';
document.head.appendChild(link3);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f9fafb' },
        { name: 'dark', value: '#1f2937' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
};

export default preview;