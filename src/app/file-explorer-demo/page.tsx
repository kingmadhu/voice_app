"use client";

import React, { useState } from "react";
import { FileExplorer, FileItem } from "@/components/file-explorer";
import { useToast } from "@/hooks/use-toast";

// Predefined content structure - eBooks with episodes
const predefinedContent: FileItem[] = [
  {
    id: "ebook-1",
    name: "The Complete Web Development Guide",
    type: "folder",
    children: [
      {
        id: "episode-1-1",
        name: "Episode 1: Getting Started with HTML",
        type: "file",
        content: `Episode 1: Getting Started with HTML
======================================

Welcome to the complete web development guide! In this episode, we'll cover the fundamentals of HTML.

What is HTML?
HTML (HyperText Markup Language) is the standard markup language for creating web pages. It provides the structure for web content.

Key Concepts:
1. Tags - HTML uses tags to define elements
   Example: <tag>content</tag>

2. Elements - A tag and its content together form an element
   Example: <p>This is a paragraph</p>

3. Attributes - Properties that modify elements
   Example: <a href="https://example.com">Link</a>

Basic HTML Structure:
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>This is a paragraph</p>
  </body>
</html>

Common Tags:
- <h1> to <h6> - Headings
- <p> - Paragraphs
- <a> - Links
- <img> - Images
- <div> - Containers
- <ul>, <ol> - Lists

Next Episode: CSS Styling Basics
Don't forget to practice what you learned!`,
      },
      {
        id: "episode-1-2",
        name: "Episode 2: CSS Styling Basics",
        type: "file",
        content: `Episode 2: CSS Styling Basics
==============================

In this episode, we explore CSS (Cascading Style Sheets) - the language of web design.

What is CSS?
CSS is used to style and layout web pages to make them visually appealing. It controls colors, fonts, spacing, and layout.

Three Ways to Add CSS:
1. Inline - directly in HTML elements
   <p style="color: blue;">Blue text</p>

2. Internal - within <style> tags in HTML
   <style>
     p { color: blue; }
   </style>

3. External - separate CSS file
   <link rel="stylesheet" href="styles.css">

CSS Selectors:
- Element selector: p { }
- Class selector: .class-name { }
- ID selector: #id-name { }
- Attribute selector: [type="text"] { }

Common CSS Properties:
- color - Text color
- background-color - Background color
- font-size - Size of text
- font-family - Font type
- margin - Space outside element
- padding - Space inside element
- border - Border around element
- width, height - Dimensions

Box Model:
The box model consists of:
1. Content - The actual content
2. Padding - Space around content
3. Border - Border around padding
4. Margin - Space outside border

Example:
div {
  width: 300px;
  padding: 20px;
  border: 2px solid black;
  margin: 10px;
}

Flexbox Introduction:
Flexbox is a layout model for building responsive layouts easily.

display: flex - Enables flexbox
flex-direction - Row or column
justify-content - Horizontal alignment
align-items - Vertical alignment

Next Episode: Advanced CSS Layouts and Responsive Design
Keep practicing!`,
      },
      {
        id: "episode-1-3",
        name: "Episode 3: JavaScript Fundamentals",
        type: "file",
        content: `Episode 3: JavaScript Fundamentals
===================================

Learn the basics of JavaScript - the programming language of the web.

What is JavaScript?
JavaScript is a programming language that enables interactive web pages. It runs in the browser and adds interactivity to websites.

Variables:
Variables store data values. Use var, let, or const.

// Using let (modern approach)
let name = "John";
let age = 25;
let salary = 50000.00;

Data Types:
1. String - "Hello World"
2. Number - 42 or 3.14
3. Boolean - true or false
4. Null - no value
5. Undefined - variable declared but not assigned
6. Object - {}
7. Array - []

Operators:
Arithmetic: + - * / % ** ++
Comparison: == === != !== < > <= >=
Logical: && || !
Assignment: = += -= *= /=

Conditional Statements:
if (condition) {
  // Code if true
} else if (otherCondition) {
  // Code if other condition true
} else {
  // Code if all false
}

Loops:
// For loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// While loop
while (condition) {
  // Code to execute
}

Functions:
function greet(name) {
  return "Hello, " + name;
}

Arrow Functions (ES6):
const greet = (name) => {
  return "Hello, " + name;
};

Arrays:
let fruits = ["apple", "banana", "orange"];
fruits.push("mango");
fruits.pop();
let first = fruits[0];

Objects:
let person = {
  name: "John",
  age: 25,
  city: "New York"
};

console.log(person.name); // John

DOM Manipulation:
// Get elements
let element = document.getElementById("id");
let elements = document.querySelectorAll(".class");

// Modify content
element.textContent = "New text";
element.innerHTML = "<p>New HTML</p>";

// Add event listeners
element.addEventListener("click", () => {
  console.log("Clicked!");
});

Next Episode: DOM Events and Interactivity
Practice writing small JavaScript programs!`,
      },
    ],
  },
  {
    id: "ebook-2",
    name: "Python Programming Handbook",
    type: "folder",
    children: [
      {
        id: "episode-2-1",
        name: "Episode 1: Python Basics",
        type: "file",
        content: `Episode 1: Python Basics
==========================

Welcome to the Python Programming Handbook. Let's start with the fundamentals.

What is Python?
Python is a high-level, interpreted programming language known for its simplicity and readability. It's widely used in web development, data science, and automation.

Installing Python:
Visit python.org and download the latest version. Make sure to add Python to your system PATH.

Your First Program:
print("Hello, World!")

Variables and Data Types:
name = "Alice"
age = 30
height = 5.8
is_student = False

Strings:
# Single or double quotes
greeting = "Hello, Python!"

# String methods
message = "python programming"
print(message.upper())  # PYTHON PROGRAMMING
print(message.capitalize())  # Python programming
print(len(message))  # 18

# String formatting
name = "Bob"
print(f"Hello, {name}!")  # Hello, Bob!

Numbers:
# Integer
count = 42

# Float
pi = 3.14159

# Math operations
result = 10 + 5 * 2
print(result)  # 20

# Power operator
print(2 ** 3)  # 8

Lists:
# Create a list
numbers = [1, 2, 3, 4, 5]

# Add items
numbers.append(6)

# Access items
print(numbers[0])  # 1

# List slicing
print(numbers[1:3])  # [2, 3]

# List methods
numbers.remove(3)
numbers.sort()
print(len(numbers))

Dictionaries:
person = {
  "name": "Charlie",
  "age": 28,
  "city": "San Francisco"
}

# Access values
print(person["name"])  # Charlie

# Add/modify
person["age"] = 29
person["job"] = "Engineer"

# Keys and values
print(person.keys())
print(person.values())

Tuples:
# Immutable sequences
coordinates = (10, 20)
print(coordinates[0])  # 10

# Unpacking
x, y = coordinates

Conditionals:
age = 25

if age >= 18:
  print("Adult")
elif age >= 13:
  print("Teenager")
else:
  print("Child")

Loops:
# For loop
for i in range(5):
  print(i)

# While loop
count = 0
while count < 5:
  print(count)
  count += 1

# Loop through list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
  print(fruit)

Functions:
def greet(name):
  return f"Hello, {name}!"

message = greet("Diana")
print(message)  # Hello, Diana!

# Default parameters
def welcome(name, age=18):
  return f"{name} is {age} years old"

Next Episode: Working with Files and Modules
Keep coding!`,
      },
      {
        id: "episode-2-2",
        name: "Episode 2: File Handling and Modules",
        type: "file",
        content: `Episode 2: File Handling and Modules
=====================================

In this episode, we learn how to work with files and use Python modules.

Reading Files:
# Read entire file
with open("data.txt", "r") as file:
  content = file.read()
  print(content)

# Read line by line
with open("data.txt", "r") as file:
  for line in file:
    print(line.strip())

# Read all lines into list
with open("data.txt", "r") as file:
  lines = file.readlines()

Writing Files:
# Write to file (creates or overwrites)
with open("output.txt", "w") as file:
  file.write("Hello, File!")

# Append to file
with open("output.txt", "a") as file:
  file.write("\nNew line")

File Modes:
- "r" - Read (default)
- "w" - Write (overwrites)
- "a" - Append (adds to end)
- "x" - Create (fails if exists)
- "b" - Binary mode
- "t" - Text mode (default)

Exception Handling:
try:
  file = open("data.txt", "r")
  content = file.read()
except FileNotFoundError:
  print("File not found!")
except IOError:
  print("Error reading file")
finally:
  file.close()

Importing Modules:
# Import entire module
import math
print(math.pi)

# Import specific items
from math import sqrt, pi
print(sqrt(16))  # 4.0

# Import with alias
import numpy as np

# List available functions
import math
print(dir(math))

Common Modules:
1. math - Mathematical functions
2. random - Random number generation
3. datetime - Date and time
4. os - Operating system interaction
5. sys - System-specific parameters
6. json - JSON encoding/decoding

Working with JSON:
import json

# Write JSON
data = {"name": "Eve", "age": 26}
with open("data.json", "w") as file:
  json.dump(data, file)

# Read JSON
with open("data.json", "r") as file:
  data = json.load(file)
  print(data["name"])

Datetime:
from datetime import datetime, timedelta

now = datetime.now()
print(now)

# Add days
tomorrow = now + timedelta(days=1)

# Format date
print(now.strftime("%Y-%m-%d"))

Random:
import random

# Random number
num = random.randint(1, 100)

# Random choice
colors = ["red", "blue", "green"]
choice = random.choice(colors)

# Shuffle list
random.shuffle(colors)

Creating Your Own Module:
# Save as my_module.py
def add(a, b):
  return a + b

def subtract(a, b):
  return a - b

# Use in another file
import my_module
result = my_module.add(5, 3)

Next Episode: Object-Oriented Programming
Happy coding!`,
      },
    ],
  },
  {
    id: "ebook-3",
    name: "React & Next.js Mastery",
    type: "folder",
    children: [
      {
        id: "episode-3-1",
        name: "Episode 1: React Basics",
        type: "file",
        content: `Episode 1: React Basics
========================

Introduction to React - A JavaScript library for building user interfaces.

What is React?
React is a JavaScript library developed by Facebook for building fast, interactive user interfaces using components.

Why React?
- Component-based - Reusable code
- Virtual DOM - Efficient updates
- One-way data flow - Predictable code
- Large ecosystem - Many libraries available

JSX - JavaScript XML:
JSX lets you write HTML-like code in JavaScript.

const element = <h1>Hello, React!</h1>;

JSX gets compiled to JavaScript:
const element = React.createElement('h1', null, 'Hello, React!');

Components:
Components are reusable pieces of UI. There are two types: functional and class components.

Functional Components:
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Using arrow function
const Greeting = (props) => {
  return <p>Welcome back!</p>;
};

JSX Expressions:
const name = "Sarah";
const element = <h1>Hello, {name}!</h1>;

// Expressions
const age = 25;
<p>You are {age > 18 ? "an adult" : "a minor"}</p>

Rendering Components:
import ReactDOM from 'react-dom';

const App = () => <h1>My React App</h1>;

ReactDOM.render(<App />, document.getElementById('root'));

Props - Passing Data:
Props are arguments passed to components.

function Greeting(props) {
  return <p>Hello, {props.name}!</p>;
}

<Greeting name="John" />
<Greeting name="Jane" />

Props are read-only - don't modify them.

State - Managing Data:
State lets components manage their own data that can change.

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// useState returns [currentValue, function to update]
// Initial value goes inside useState()

Events:
function ButtonClick() {
  const handleClick = () => {
    console.log('Clicked!');
  };
  
  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}

// Pass parameters
<button onClick={() => handleClick(id)}>Delete</button>

Common Events:
- onClick
- onChange
- onSubmit
- onFocus
- onBlur
- onHover
- onKeyDown

Conditional Rendering:
function LoginStatus(props) {
  if (props.isLoggedIn) {
    return <p>Welcome back!</p>;
  }
  return <p>Please log in</p>;
}

// Using ternary operator
<p>{isLoggedIn ? 'Welcome' : 'Login'}</p>

// Using logical AND
<p>{isAdmin && 'Admin Panel'}</p>

Lists and Keys:
function ItemList(props) {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// Always use a unique 'key' prop when rendering lists

Next Episode: Hooks and Advanced State Management
See you in the next episode!`,
      },
    ],
  },
];

export default function FileExplorerDemo() {
  const [selectedContent, setSelectedContent] = useState<FileItem | null>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    toast({
      title: "Upload Feature",
      description: "File upload feature would be implemented here",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📚 eBook Content Library
          </h1>
          <p className="text-lg text-gray-600">
            Browse predefined eBooks and episodes, or upload your own content
            for text-to-speech conversion
          </p>
        </div>

        {/* File Explorer Component with both sections */}
        <FileExplorer
          items={[]}
          predefinedItems={predefinedContent}
          onFileSelect={(file) => {
            console.log("Selected file:", file);
            setSelectedContent(file);
            if (file.type === "file") {
              toast({
                title: "Content Loaded",
                description: `"${file.name}" is ready for text-to-speech conversion`,
              });
            }
          }}
          onUploadClick={handleUploadClick}
          defaultContent="👉 Select an eBook from the Predefined section to view episodes, or upload your own content"
        />
      </div>
    </div>
  );
}
