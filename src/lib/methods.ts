import { IMethod, IValue } from "./types";
import { createMethod } from "./utils";

export const stringMethods = [
  createMethod("length", [], (value: string) => {
    return value.length;
  }),
  createMethod("toUpperCase", [], (value: string) => {
    return value.toUpperCase();
  }),
  createMethod("toLowerCase", [], (value: string) => {
    return value.toLowerCase();
  }),
  createMethod("toNumber", [], (value: string) => {
    return Number(value);
  }),
  createMethod("capitalize", [], (value: string) => {
    let func = (word: string) => word[0].toUpperCase() + word.slice(1);
    return value.split(" ").map(func).join(" ");
  }),
];

export const numberMethods = [
  createMethod("add", [0], (value: number, p1: number) => {
    return value + p1;
  }),
  createMethod("subtract", [0], (value: number, p1: number) => {
    return value - p1;
  }),
  createMethod("multiply", [0], (value: number, p1: number) => {
    return value * p1;
  }),
  createMethod("divide", [0], (value: number, p1: number) => {
    return value / p1;
  }),
  createMethod("toString", [], (value: number) => {
    return String(value);
  }),
];

export const operationMethods: Record<IValue, IMethod[]> = {
  string: stringMethods,
  number: numberMethods,
};
