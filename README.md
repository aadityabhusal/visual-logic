# Logic Flow

Coding made simple by chaining operations on data.

## Demo

#### Click the image below to watch the demo.

[![Watch the video](https://img.youtube.com/vi/AOfOhNwQL64/hqdefault.jpg)](https://www.youtube.com/watch?v=AOfOhNwQL64)

## Entities

1. **Operation**
   - Has a series of statements of Statement type
   - Has a set of parameters of Statement type
   - Has a set of closures containing previous statements of current and parent scope
   - Can be either of a generic type or have a fixed type based on its parameters and return type
   - Can reference another Operation's definition and value (when called) as variable
2. **Statement**
   - Has the Data or Operation as the first item
   - Adds a chain of Methods after the first Data entity
   - Has a name for referencing its result value
3. **Data**
   - A value of type: string, number, boolean, array and object
   - Can be either of a generic type or have a fixed type
   - Can reference another Data's value as variable
4. **Method**
   - An Operation-like entity with parameters and a result type
   - Chained after a Statement's Data taking the previous entity's result as first parameter

## Setup and Development

Install `yarn` package manager. Run `yarn install` to install all the packages and `yarn dev` to start the development server

### Typechecking

Since, the project uses Vite as build tool which [doesn't perform](https://vitejs.dev/guide/features.html#transpile-only) type checking during development. We can use `tsc --noEmit --watch` in a separate terminal to check of types errors throughout the project.
