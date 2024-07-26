import type { Meta } from "@storybook/react";
import { FxCard } from "./index";

const Story: Meta<typeof FxCard> = {
  component: FxCard,
  title: "FxCard",
  tags: ['autodocs']
};
export default Story;

export const Primary = {
  args: {
    title: "默认标题",
    prefixIcon: true,
  },
};
