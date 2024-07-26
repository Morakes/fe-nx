// Replace your-renderer with the renderer you are using (e.g., react, vue3)
import { Preview } from '@storybook/vue3';

const preview: Preview = {
  parameters: {
    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#333' },
      ],
    },
  },
  
};

export default preview;