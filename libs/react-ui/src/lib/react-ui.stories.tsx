import type { Meta, StoryObj } from '@storybook/react';
import { ReactUi } from './react-ui';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof ReactUi> = {
  component: ReactUi,
  title: 'ReactUi',
};
export default meta;
type Story = StoryObj<typeof ReactUi>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to ReactUi!/gi)).toBeTruthy();
  },
};
