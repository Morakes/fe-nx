// Button.stories.js
import Button from './example.vue';

export default {
  title: 'Example/Button',
  component: Button,
  argTypes: {
    // controls the properties of the component
    message: { control: 'text', defaultValue: 'hello world' },
    count: { control: 'number', defaultValue: 0 }
  },
};

const Template = (args) => ({
  components: { Button },
  setup() {
    return { args };
  },
  template: '<Button v-bind="args" />',
});

export const Primary = Template.bind({});
Primary.args = {
  message: 'My Custom Message',
};

export const Counter = Template.bind({});
Counter.args = {
  count: 5,
  message: 'My Custom Count',
};