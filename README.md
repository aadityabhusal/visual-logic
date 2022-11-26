# Visual Logic

Creating programming logic visually in a functional way.

## Learnings Requirements

- Functional Programming 
- Meta Programming
- Logic Building Blocks (Flowchart, other diagrammatical ways)

## Hierarchy
  
1. Function - A series of Statements with a context that has:
   - A set of parameters
   - The Data it is called upon (Q. can the Data be the first parameter instead?)
   - A return value (Data or void)
2. Statement - A Data with chain of Operations
   - Returns a Data
   - the returned Data can be stored in an variable (inside a Function)
3. Data - A value with a set of Operation to manipulate its value or type
   - The values are of type: string, number, array, object, void
4. Method/Operation - A Function called upon a fixed Data


# Entities
## Function
- Function provided function could be inside a Namespace (possible entity)
  - A name space will have a collection of function (e.g. Elixir)
- Functions cannot access any outer variable
  - There will be a collection of readonly `global` values created at the start
  - User can use those values inside the any function e.g. `global.theme.color`
  - Global values will be available similar to a Namespace

# Notes
- I need to create a Function type and then use it for Methods and series of Statements (could have recursive behavior where you need a Method for Function and Function for Method)
- Could there be just two entities Data and Function(with context)? If so, both Data and Function is created. Just need to create context for the function
- Should there be the concept of Closures? If yes, how restricted should it be?
- The program need to allow the developes to their own Data with a collection of primitive Data and methods. Should there be the concept of instantiation similar to OOP
- There could be another entity called Type for creating types and interfaces