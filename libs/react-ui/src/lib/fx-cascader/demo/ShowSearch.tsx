import React, { useState } from "react";
import { Space, Switch } from "antd";
import { FxCascader } from "../index";
import mock from "../mock";

const ShowSearch = (props) => {
  const [showSearch, setShowSearch] = useState(false);
  return (
    <Space direction="vertical">
      <Switch checked={showSearch} onChange={(v) => setShowSearch(v)}/>
      <FxCascader showSearch={showSearch} options={mock} {...props} />
    </Space>
  );
};

export default ShowSearch;
