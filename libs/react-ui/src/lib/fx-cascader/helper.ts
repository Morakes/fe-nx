
import { CascaderPanelProps } from "./interface"

export const listScrollStyle = (virtual: CascaderPanelProps['virtual']): React.CSSProperties => {
  return {overflow: virtual ? 'hidden' : 'auto', overflowX: 'hidden'}
}