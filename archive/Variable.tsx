import { IContextProps, IVariable } from "../src/lib/types";
import { getValueFromContext } from "../src/lib/utils";

export function Variable({
  variable,
  context,
  handleVariable,
}: {
  variable: IVariable;
  handleVariable: (variable: IVariable, remove?: boolean) => void;
  context: IContextProps;
}) {
  const data = getValueFromContext({ id: variable.referenceId, context });

  return <div>{variable.name}</div>;
}
