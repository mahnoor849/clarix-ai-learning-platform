// 6 OOP Concepts with prerequisites and difficulty levels
export const concepts = {
  C001: {
    id: 'C001',
    name: 'Classes and Objects',
    short: 'Classes & Objects',
    difficulty: 'Basic',
    prerequisites: [],
    description: 'Understanding the fundamental building blocks of OOP — how classes define blueprints and objects are instances created from them.',
    fallbackContent: `## Classes and Objects in Java

A **class** is a blueprint or template that defines the structure (fields) and behavior (methods) of objects. An **object** is a specific instance created from that class.

**Real-world analogy:** Think of a class as a cookie cutter, and objects as the actual cookies you make with it. Each cookie (object) is shaped by the cutter (class) but can have different decorations (field values).

\`\`\`java
// Class definition (the blueprint)
class Student {
    String name;
    int age;
    
    void introduce() {
        System.out.println("I'm " + name + ", age " + age);
    }
}

// Creating objects (instances)
Student s1 = new Student();
s1.name = "Ali";
s1.age = 20;

Student s2 = new Student();
s2.name = "Sara";
s2.age = 22;
\`\`\`

**Key Points:**
- The \`new\` keyword creates an object in memory
- Each object has its own copy of instance fields
- A class can create unlimited objects
- Declaring a reference without \`new\` gives \`null\``,
  },
  C002: {
    id: 'C002',
    name: 'Encapsulation',
    short: 'Encapsulation',
    difficulty: 'Basic',
    prerequisites: ['C001'],
    description: 'Learning how to protect data by restricting direct access using access modifiers and controlled methods.',
    fallbackContent: `## Encapsulation in Java

**Encapsulation** means bundling data (fields) with the methods that operate on it, and restricting direct access to the data. This protects the internal state of objects.

**Real-world analogy:** A bank ATM. You can deposit and withdraw money through the machine (methods), but you can't reach into the vault directly (private field).

\`\`\`java
class BankAccount {
    private double balance; // Hidden from outside
    
    public double getBalance() { // Controlled read
        return balance;
    }
    
    public void deposit(double amount) { // Controlled write
        if (amount > 0) {
            balance += amount;
        }
    }
}
\`\`\`

**Key Points:**
- \`private\` hides fields from outside the class
- Getters provide read access, setters provide write access
- Not every field needs both getter and setter
- Encapsulation enforces data integrity through validation`,
  },
  C003: {
    id: 'C003',
    name: 'Inheritance',
    short: 'Inheritance',
    difficulty: 'Intermediate',
    prerequisites: ['C001', 'C002'],
    description: 'Understanding how subclasses extend parent classes to inherit fields and methods, creating hierarchical relationships.',
    fallbackContent: `## Inheritance in Java

**Inheritance** lets a child class (subclass) acquire the fields and methods of a parent class (superclass). The child can add new behavior or override existing behavior.

**Real-world analogy:** A "Vehicle" is the parent category. "Car" and "Motorcycle" are children that inherit common features like speed and fuel, but add their own specifics.

\`\`\`java
class Animal {
    String name;
    void eat() {
        System.out.println(name + " is eating");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println(name + " says Woof!");
    }
}

Dog d = new Dog();
d.name = "Buddy";
d.eat();  // Inherited from Animal
d.bark(); // Dog's own method
\`\`\`

**Key Points:**
- Use \`extends\` keyword to create inheritance
- Private fields are not directly accessible in subclasses
- Java does NOT support multiple class inheritance
- Constructors are not inherited; use \`super()\` to call parent constructor`,
  },
  C004: {
    id: 'C004',
    name: 'Method Overloading',
    short: 'Overloading',
    difficulty: 'Intermediate',
    prerequisites: ['C001'],
    description: 'Learning how multiple methods with the same name but different parameter lists enable compile-time polymorphism.',
    fallbackContent: `## Method Overloading in Java

**Method overloading** means having multiple methods with the **same name** but **different parameter lists** in the same class. The compiler selects the correct version based on the arguments.

\`\`\`java
class Calculator {
    int add(int a, int b) {
        return a + b;
    }
    
    double add(double a, double b) {
        return a + b;
    }
    
    int add(int a, int b, int c) {
        return a + b + c;
    }
}

Calculator calc = new Calculator();
calc.add(2, 3);       // calls int version → 5
calc.add(2.5, 3.5);   // calls double version → 6.0
calc.add(1, 2, 3);    // calls three-param version → 6
\`\`\`

**Key Points:**
- Methods must differ in parameter list (number, type, or order)
- Return type alone does NOT create an overload
- Overloading does NOT require inheritance
- Selected at **compile time** (static polymorphism)`,
  },
  C005: {
    id: 'C005',
    name: 'Method Overriding',
    short: 'Overriding',
    difficulty: 'Intermediate',
    prerequisites: ['C003'],
    description: 'Understanding how a subclass provides its own implementation of a parent method, enabling runtime polymorphism.',
    fallbackContent: `## Method Overriding in Java

**Method overriding** occurs when a subclass provides its own implementation of a method that already exists in the parent class. The method must have the **same signature**.

\`\`\`java
class Animal {
    void sound() {
        System.out.println("Some generic sound");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Bark!");
    }
}

Animal a = new Dog(); // Parent reference, child object
a.sound(); // Prints "Bark!" — runtime polymorphism
\`\`\`

**Key Points:**
- Requires inheritance (\`extends\`)
- Same method name AND parameter list
- \`@Override\` is optional but recommended
- Selected at **runtime** based on actual object type
- Private methods cannot be overridden`,
  },
  C006: {
    id: 'C006',
    name: 'Polymorphism',
    short: 'Polymorphism',
    difficulty: 'Advanced',
    prerequisites: ['C003', 'C004', 'C005'],
    description: 'The pinnacle OOP concept — understanding how one interface can take many forms through overloading and overriding.',
    fallbackContent: `## Polymorphism in Java

**Polymorphism** means "many forms." In Java, it allows a single reference type to work with objects of different classes.

- **Compile-time polymorphism** = method overloading (resolved by compiler)
- **Runtime polymorphism** = method overriding (resolved by JVM at runtime)

\`\`\`java
class Shape {
    void draw() { System.out.println("Drawing shape"); }
}

class Circle extends Shape {
    @Override
    void draw() { System.out.println("Drawing circle"); }
}

class Square extends Shape {
    @Override
    void draw() { System.out.println("Drawing square"); }
}

// Polymorphism in action
Shape s1 = new Circle();
Shape s2 = new Square();
s1.draw(); // "Drawing circle"
s2.draw(); // "Drawing square"
\`\`\`

**Key Points:**
- Reference type determines what methods you can CALL
- Actual object type determines which implementation RUNS
- Works with both classes and interfaces
- Enables flexible, extensible code design`,
  },
};

// Concept IDs in prerequisite order
export const conceptOrder = ['C001', 'C002', 'C003', 'C004', 'C005', 'C006'];
