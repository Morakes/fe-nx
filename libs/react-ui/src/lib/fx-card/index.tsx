import { Card, CardProps } from "antd";
import React, { memo } from "react";
import cs from "classnames";
import styles from "./index.module.scss";
interface IProps extends CardProps {
  className?: string;
}

const _FxCard: React.FC<React.PropsWithChildren<IProps>> = (props) => {
  const { className, title, children, ...rest } = props;
  return (
    <Card
      className={cs(title ? styles['fx-primary-card'] : styles['fx-card'], className)}
      title={title}
      style={{ marginTop: 16 }}
      {...rest}
    >
      {children}
    </Card>
  )
};

export const FxCard = memo(_FxCard);

export default FxCard;
