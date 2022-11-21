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

# Notes
- I need to create a Function type and then use it for Methods and series of Statements (could have recursive behavior where you need a Method for Function and Function for Method)
- Could there be just two entities Data and Function(with context)? If so, both Data and Function is created. Just need to create context for the function 