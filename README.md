# Visual Logic

Creating programming logic visually in a functional way.

## Learnings Requirements

- Functional Programming 
- Meta Programming
- Logic Building Blocks (Flowchart, other diagrammatical ways)

## Hierarchy
  
1. **Function**
   - Has a series of Statements with a context
   - Has a set of parameters
   - Context has a collection of local, parent and global values
   - A return value (Data or void)
2. **Statement**
   - A Data with chain of Operations (or a function definition)
   - Returns a Data
   - Has a variable for referencing its returned data
3. **Data**
   - A value of type: string, number, array, object, void
   - Has the value of a referenced Data's variable as name 
4. **Method** 
   - A Function called upon a fixed Data


## Entities
### Function
- Function provided function could be inside a Namespace (possible entity)
  - A name space will have a collection of function (e.g. Elixir)
  - Functions cannot modify any outer variable (need to provide a way to modify)
  - There will be a collection of readonly `global` values created at the start
  - User can use those values inside any function e.g. `global.theme.color`
  - Global values will be available similar to a Namespace
