import Demo from './custom-column.vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { CustomProps, GroupColumnType } from './typing'

type Story = StoryObj<typeof Demo>;

const meta: Meta<typeof Demo> = {
  title: 'Component组件/CustomColumn 自定义列',
  component: Demo,
  argTypes: {
    showColumns: { control: { type: 'object' } },
    groupColumn: { control: { type: 'object' }, defaultValue: [] },
    keyName: { control: { type: 'text' }, defaultValue: 'key' },
  },
  // tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '基于ant-design-vue4.x 组件封装的自定义列选择器',
      },
    },
  },
}

export default meta;

export const Primary: Story = {
  render: (args: CustomProps) => ({
    components: { Demo },
    setup() {
      return { args };
    },
    template: '<Demo v-bind="args" />',
  }),
  args: {
    /**
     * 列状态缓存
     */
    showColumns: {
      common: [],
      fixed: [],
    },
    groupColumn: [
      {
        label: '回本分析',
        children: [
          {
            dataIndex: 'roi0',
            title: '累计ROI',
            width: 120,
            align: 'right' as const,
          },
          ...[0, 3, 5, 7, 15, 30, 60, 90].map((i) => ({
            dataIndex: `roi${i}`,
            title: `${i === 0 ? '首' : i}日ROI`,
            width: 120,
          })),
        ],
      },
    ],
    keyName: 'key',
  },
};


export const Secondary: Story = {
  render: (args: {
    showColumns: Record<string, []>;
    groupColumn: GroupColumnType[];
    keyName: string;
  }) => ({
    components: { Demo },
    setup() {
      return { args };
    },
    template: '<Demo v-bind="args">自定义名称、弹窗、按钮</Demo>',
  }),
  args: {
    /**
     * 列状态缓存
     */
    showColumns: {
      common: [],
      fixed: [],
    },
    groupColumn: [
      {
        label: '默认选中的列 ',
        children: [
          {
            dataIndex: 'roi0',
            title: '累计ROI',
            width: 120,
            align: 'right' as const,
          },
          ...[0, 3, 5, 7, 15, 30, 60, 90].map((i) => ({
            dataIndex: `roi${i}`,
            title: `${i === 0 ? '首' : i}日ROI`,
            width: 120,
          })),
        ],
      },
    ],
    keyName: 'key',
    buttonProps: {
      type: 'primary'
    },
    modalProps: {
      title: '自定义名称',
    }
  },
};