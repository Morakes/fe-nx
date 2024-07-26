import React, { useState } from "react";
import { FxCascader, FxCascaderProps } from "../index";
import mock from "../mock";

const Default = (props: FxCascaderProps) => {
  const [value, setValue] = useState<number[]>([]);
  return <FxCascader options={mock} value={value} onChange={(v) => setValue(v as number[])} {...props} />;
};

export default Default;
