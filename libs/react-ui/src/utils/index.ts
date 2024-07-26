import { PREFIX_CLASS_NAMES } from "../constant";

export const classNames = (suffix: string | string[]) => {
  if (Array.isArray(suffix)) {
  let result = '';
    suffix.forEach(item => {
      if (item) {
        result += `${PREFIX_CLASS_NAMES}-${item} `;
      }
    });
    return result;
  }
  return `${PREFIX_CLASS_NAMES}-${suffix}`;
}