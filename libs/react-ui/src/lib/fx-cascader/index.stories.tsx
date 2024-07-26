import type { Meta, StoryObj } from '@storybook/react';
import { Default as Demo } from './demo';
import FxCascader, { FxCascaderProps } from './index';

const Story: Meta<typeof FxCascader> = {
  component: FxCascader,
  title: 'FxCascader',
  parameters: {
    docs: {
      description: {
        component: '基于Antd5.x Select组件封装的级联选择器',
      },
    },
  },
  argTypes: {
    mode: {
      defaultValue: 'multiple',
      options: ['single', 'multiple'],
      control: { type: 'inline-radio' },
      description: '单选/多选',
    },
    virtual: {
      defaultValue: false,
      type: 'boolean',
      description: '虚拟列表',
    },
    showCheckedStrategy: {
      defaultValue: 'all',
      options: ['all', 'parent', 'child'],
      control: { type: 'inline-radio' },
      description: '只在多选模式下生效',
    },
    showSearch: {
      defaultValue: true,
      type: 'boolean',
      description: '开始搜索栏',
    },
    itemTooltip: {
      defaultValue: true,
      type: 'boolean',
      description: '文字提示，可是指maxLength，超出长度默认显示',
    },
    popupMatchSelectWidth: {
      defaultValue: 550,
      type: "number",
      description: '弹出框宽度',
    },
  },
  tags: ['autodocs'],
};
export default Story;

export const Primary: StoryObj<FxCascaderProps> = {
  name: '基本使用',
  args: {
    style: {
      width: 220,
    },
    showSearch: false,
    virtual: false,
    showCheckedStrategy: 'all',
    itemTooltip: true,
    fieldNames: {
      label: 'channel_alias',
      value: 'channel_id',
    },
    mode: 'single',
  },
  render(props) {
    return <Demo {...props} />
  }
};
