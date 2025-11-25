import { IUiConfig } from "./store";
import { IData, IStatement, OperationType } from "./types";
import { isDataOfType } from "./utils";

export type NavigationDirection = "left" | "right" | "up" | "down";
export type NavigationModifier = "alt" | "mod";
type NavigationEntity = {
  entity: IData;
  statementIndex: number;
  depth: number;
};

function shouldFocusInInput(
  event: KeyboardEvent,
  direction: NavigationDirection,
  modifier?: NavigationModifier,
  disable?: boolean
) {
  const upDownKey = direction === "up" || direction === "down";
  const input = document.activeElement;
  if (!(input instanceof HTMLInputElement)) return false;
  if ((upDownKey && !disable) || modifier === "mod") {
    return event.preventDefault(), input.blur(), false;
  }

  const start = input.selectionStart ?? 0;
  if (start !== (input.selectionEnd ?? 0)) return true;

  const isAtBoundary =
    direction === "left" ? start === 0 : start === input.value.length;
  if (!isAtBoundary || upDownKey) return true;

  return event.preventDefault(), input.blur(), false;
}

export function handleNavigation({
  event,
  direction,
  entities,
  modifier,
  navigation,
  setUiConfig,
}: {
  event: KeyboardEvent;
  direction: NavigationDirection;
  navigation: IUiConfig["navigation"];
  setUiConfig: IUiConfig["setUiConfig"];
  entities: NavigationEntity[];
  modifier?: NavigationModifier;
}): void {
  if (
    !navigation ||
    shouldFocusInInput(event, direction, modifier, navigation.disable)
  ) {
    return;
  }

  let targetEntity: NavigationEntity | undefined;
  const delta = direction === "left" || direction === "up" ? -1 : 1;
  let index = entities.findIndex((e) => e.entity.id === navigation.id);
  if (index === -1 && direction === "left") index = entities.length;

  if (direction === "left" || direction === "right") {
    if (modifier === "mod") {
      const statementEntities = entities.filter(
        (e) => e.statementIndex === entities[index].statementIndex
      );
      targetEntity =
        delta === -1
          ? statementEntities[0]
          : statementEntities[statementEntities.length - 1];
    } else {
      targetEntity = entities[index + delta];
    }
  } else if (direction === "up" || direction === "down") {
    if (modifier === "mod") {
      targetEntity = delta === -1 ? entities[0] : entities[entities.length - 1];
    } else {
      targetEntity = entities.find(
        (e) => e.statementIndex === entities[index].statementIndex + delta
      );
    }
  }

  if (targetEntity) {
    setUiConfig((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        id: targetEntity.entity.id,
        direction,
        modifier,
      },
    }));
  }
}

export function getOperationEntities(
  operation: IData<OperationType>,
  depth = 0
) {
  const parameterEntities = operation.value.parameters.flatMap((item) =>
    getStatementEntities(item, depth, 0)
  );
  const statementEntities = operation.value.statements.flatMap((statement, i) =>
    getStatementEntities(statement, depth, i + 1)
  );
  return parameterEntities.concat(statementEntities);
}

function getStatementEntities(
  statement: IStatement,
  depth: number,
  statementIndex: number
): NavigationEntity[] {
  const entities: NavigationEntity[] = [];
  entities.push({ entity: statement.data, statementIndex, depth });

  if (isDataOfType(statement.data, "array")) {
    statement.data.value.forEach((arrayItem) => {
      entities.push(
        ...getStatementEntities(arrayItem, depth + 1, statementIndex)
      );
    });
  } else if (isDataOfType(statement.data, "object")) {
    statement.data.value.forEach((objectValue) => {
      entities.push(
        ...getStatementEntities(objectValue, depth + 1, statementIndex)
      );
    });
  } else if (isDataOfType(statement.data, "operation")) {
    entities.push(...getOperationEntities(statement.data, depth + 1));
  }

  statement.operations.forEach((operation) => {
    entities.push({ entity: operation, statementIndex, depth });

    operation.value.parameters.forEach((param) => {
      entities.push(...getStatementEntities(param, depth + 1, statementIndex));
    });
  });

  return entities;
}
