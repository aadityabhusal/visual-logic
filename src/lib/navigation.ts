import { IUiConfig } from "./store";
import {
  ConditionType,
  DataValue,
  IData,
  IStatement,
  OperationType,
} from "./types";
import {
  createData,
  createStatement,
  inferTypeFromValue,
  isDataOfType,
} from "./utils";

export type NavigationDirection = "left" | "right" | "up" | "down";
export type NavigationModifier = "alt" | "mod";
export type NavigationEntity = {
  id: string;
  parentIndex: [operation: number, statement: number];
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
  if (!(input instanceof HTMLInputElement) || input.type !== "text") {
    if (disable) return true;
    if (input instanceof HTMLButtonElement) input.blur();
    return false;
  }
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

function isSameIndex(
  indexA: NavigationEntity["parentIndex"],
  indexB?: NavigationEntity["parentIndex"]
) {
  return indexA[0] === indexB?.[0] && indexA[1] === indexB?.[1];
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
  let itemIndex = entities.findIndex((entity) => entity.id === navigation.id);
  if (itemIndex === -1 && direction === "left") itemIndex = entities.length;

  if (direction === "left" || direction === "right") {
    if (modifier === "mod") {
      const statementEntities = entities.filter((e) =>
        isSameIndex(e.parentIndex, entities[itemIndex].parentIndex)
      );
      targetEntity =
        statementEntities[delta === -1 ? 0 : statementEntities.length - 1];
    } else {
      targetEntity = entities[itemIndex + delta];
    }
  } else if (direction === "up" || direction === "down") {
    if (modifier === "mod") {
      targetEntity = entities[delta === -1 ? 0 : entities.length - 1];
    } else {
      targetEntity = entities.find(
        (e) => e.parentIndex[1] === entities[itemIndex].parentIndex[1] + delta
      );
    }
  }

  if (targetEntity) {
    setUiConfig((p) => ({
      ...p,
      navigation: {
        id: targetEntity.id,
        direction,
        modifier,
      },
    }));
  }
}

export function getOperationEntities(
  operation: IData<OperationType>,
  depth = 0,
  operationIndex = 0
): NavigationEntity[] {
  const parameterEntities = operation.value.parameters.flatMap((item) =>
    getStatementEntities(item, depth, [operationIndex, 0])
  );
  const statementEntities = operation.value.statements.flatMap((statement, i) =>
    getStatementEntities(statement, depth, [operationIndex, i + 1], true)
  );
  const statementIndex = operation.value.statements.length + 1;
  const parentIndex = [operationIndex, statementIndex] as [number, number];
  return [
    ...parameterEntities,
    {
      id: `${operation.id}_parameter_add`,
      depth,
      parentIndex: [operationIndex, 0],
    },
    ...statementEntities,
    { id: `${operation.id}_statement_add`, depth, parentIndex },
  ];
}

function getStatementEntities(
  statement: IStatement,
  depth: number,
  parentIndex: NavigationEntity["parentIndex"],
  allowVariable?: boolean
): NavigationEntity[] {
  const entities: NavigationEntity[] = [];
  if (statement.name) {
    entities.push({ id: `${statement.id}_name`, depth, parentIndex });
  }
  if (allowVariable) {
    entities.push({ id: `${statement.id}_add`, depth, parentIndex });
    entities.push({ id: `${statement.id}_equals`, depth, parentIndex });
  }
  const dataId = statement.data.id;
  entities.push({ id: dataId, depth, parentIndex });

  if (isDataOfType(statement.data, "array")) {
    statement.data.value.forEach((arrayItem) => {
      entities.push(...getStatementEntities(arrayItem, depth + 1, parentIndex));
    });
    entities.push({ id: `${dataId}_add`, depth: depth + 1, parentIndex });
  } else if (isDataOfType(statement.data, "object")) {
    statement.data.value.forEach((objectValue) => {
      entities.push(
        ...getStatementEntities(objectValue, depth + 1, parentIndex)
      );
    });
    entities.push({ id: `${dataId}_add`, depth: depth + 1, parentIndex });
  } else if (isDataOfType(statement.data, "operation")) {
    entities.push(
      ...getOperationEntities(statement.data, depth + 1, parentIndex[0] + 1)
    );
  } else if (isDataOfType(statement.data, "condition")) {
    (["condition", "true", "false"] as const).forEach((item) => {
      const branch = (statement.data.value as DataValue<ConditionType>)[item];
      entities.push(...getStatementEntities(branch, depth + 1, parentIndex));
    });
  } else if (isDataOfType(statement.data, "union")) {
    const valueType = inferTypeFromValue(statement.data.value);
    const dataStatement = createStatement({
      data: createData({
        id: `${dataId}_data`,
        type: valueType,
        value: statement.data.value,
      }),
    });
    entities.push(
      ...getStatementEntities(dataStatement, depth + 1, parentIndex)
    );
    entities.push({ id: `${dataId}_options`, depth: depth + 1, parentIndex });
  }

  statement.operations.forEach((operation) => {
    entities.push({ id: operation.id, depth, parentIndex });

    operation.value.parameters.forEach((param) => {
      entities.push(...getStatementEntities(param, depth + 1, parentIndex));
    });
  });

  return entities;
}
