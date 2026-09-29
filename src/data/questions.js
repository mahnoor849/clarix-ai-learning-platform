// Diagnostic questions — shown during initial assessment
export const diagnosticQuestions = [
  {
    id: 'DQ1',
    concept: 'C001',
    difficulty: 'Basic',
    text: 'What is the difference between a class and an object in Java?',
    options: [
      'They are the same thing',
      'A class is a blueprint; an object is an instance',
      'An object defines structure; a class is created from it',
      'Classes are runtime; objects are compile-time',
    ],
    answer: 'A class is a blueprint; an object is an instance',
  },
  {
    id: 'DQ2',
    concept: 'C002',
    difficulty: 'Basic',
    text: 'What does the private keyword do to a field in Java?',
    options: [
      'Makes it available everywhere',
      'Deletes it after use',
      'Restricts access to within the same class',
      'Makes it a constant',
    ],
    answer: 'Restricts access to within the same class',
  },
  {
    id: 'DQ3',
    concept: 'C003',
    difficulty: 'Intermediate',
    text: 'Which keyword is used in Java to create inheritance?',
    options: ['implements', 'extends', 'inherits', 'super'],
    answer: 'extends',
  },
  {
    id: 'DQ4',
    concept: 'C004',
    difficulty: 'Intermediate',
    text: 'Method overloading requires methods to have:',
    options: [
      'The same parameters but different names',
      'Different return types only',
      'The same name but different parameter lists',
      'An inheritance relationship',
    ],
    answer: 'The same name but different parameter lists',
  },
  {
    id: 'DQ5',
    concept: 'C005',
    difficulty: 'Intermediate',
    text: "A subclass overrides a parent method. A parent-type reference holds a child object. Which method runs?",
    options: [
      'Always the parent',
      'Always the child',
      'The child, because runtime selects by actual object',
      'Depends on the compiler',
    ],
    answer: 'The child, because runtime selects by actual object',
  },
  {
    id: 'DQ6',
    concept: 'C006',
    difficulty: 'Advanced',
    text: 'What is runtime polymorphism in Java?',
    options: [
      'Calling overloaded methods',
      "A parent reference invoking a child's overridden method at runtime",
      'Casting objects to different types',
      'Using interfaces only',
    ],
    answer: "A parent reference invoking a child's overridden method at runtime",
  },
];

// Full question bank — 36 questions for assessment
export const questionBank = [
  // C001 — Classes and Objects
  {
    id: 'Q001', concept: 'C001', type: 'MCQ', difficulty: 'Basic',
    text: 'Which keyword creates a new object in Java?',
    options: ['class', 'new', 'object', 'create'],
    answer: 'new',
    explanation: "The 'new' keyword allocates memory and calls the constructor to create an object instance.",
    hints: [
      'Think about the keyword you use right before a constructor call.',
      'When you write Student s = ___ Student(), what goes in the blank?',
      "It's a 3-letter keyword that allocates memory for the object.",
    ],
  },
  {
    id: 'Q002', concept: 'C001', type: 'MCQ', difficulty: 'Basic',
    text: 'What does a class define in Java?',
    options: ['An instance', 'A blueprint for objects', 'A running program', 'A memory address'],
    answer: 'A blueprint for objects',
    explanation: 'A class is a template that defines fields (data) and methods (behaviour) shared by all its objects.',
    hints: [
      'A class is like an architectural plan for a house.',
      'It defines structure (fields) and behavior (methods) but is not an actual thing in memory itself.',
      'Objects are created FROM this template — the template itself is called a ___.',
    ],
  },
  {
    id: 'Q003', concept: 'C001', type: 'Short Answer', difficulty: 'Intermediate',
    text: 'Explain the difference between a class and an object with a real-world example.',
    answer: 'A class is a blueprint (e.g. Car design); an object is a specific instance created from it (e.g. a red Honda Civic).',
    explanation: 'The class defines structure and behaviour. Each object is an independent instance with its own state.',
    hints: [
      'Think template vs. actual thing.',
      'One is a design/plan, the other is a real thing created from that plan.',
      'Example: A "Student" class is the form template; "Ali" with his specific grades is an object.',
    ],
  },
  {
    id: 'Q004', concept: 'C001', type: 'Code Output', difficulty: 'Intermediate',
    text: 'What does the following code print?\n```java\nStudent s = new Student();\ns.name = "Ali";\nSystem.out.println(s.name);\n```',
    answer: 'Ali',
    explanation: "The object s is created, the name field is set to 'Ali', and then it is printed.",
    hints: [
      'Follow the code line by line — what value is assigned to s.name?',
      'System.out.println prints whatever is inside the parentheses.',
      'The name field was set to "Ali" on line 2, so line 3 prints that value.',
    ],
  },
  {
    id: 'Q005', concept: 'C001', type: 'MCQ', difficulty: 'Advanced',
    text: 'What happens if you declare Student s1; without using new?',
    options: [
      's1 holds a default Student',
      's1 is null — no object created',
      'A Student is created automatically',
      'Compile error always occurs',
    ],
    answer: 's1 is null — no object created',
    explanation: 'Declaring a reference variable without \'new\' gives it a null value. No object exists in memory yet.',
    hints: [
      'Think about what happens when you only declare a reference variable.',
      'Without the new keyword, is any memory allocated for an object?',
      'The reference exists but points to nothing — it holds a special value meaning "no object".',
    ],
  },
  {
    id: 'Q006', concept: 'C001', type: 'True/False', difficulty: 'Advanced',
    text: 'Two objects of the same class always share the same field values.',
    answer: 'False',
    explanation: 'Each object maintains its own independent state. Two Student objects can have different names and marks.',
    hints: [
      'Think about two Student objects — must they have the same name?',
      'Each object gets its own copy of instance fields.',
      'If s1.name = "Ali" and s2.name = "Sara", they clearly have different values.',
    ],
  },

  // C002 — Encapsulation
  {
    id: 'Q007', concept: 'C002', type: 'MCQ', difficulty: 'Basic',
    text: 'Which access modifier hides a field from code outside the class?',
    options: ['public', 'protected', 'private', 'default'],
    answer: 'private',
    explanation: 'private restricts field access to within the same class, enforcing encapsulation.',
    hints: [
      'Which keyword means "only this class can see it"?',
      'It is the most restrictive access modifier in Java.',
      "It starts with 'p' and is 7 letters long.",
    ],
  },
  {
    id: 'Q008', concept: 'C002', type: 'MCQ', difficulty: 'Basic',
    text: 'What is the purpose of a getter method?',
    options: [
      'To delete a field',
      'To provide read access to a private field',
      'To make a field public',
      'To create an object',
    ],
    answer: 'To provide read access to a private field',
    explanation: 'A getter exposes the value of a private field in a controlled way without making the field directly accessible.',
    hints: [
      'A getter "gets" something — but what?',
      'If a field is private, how can other classes read its value?',
      'It returns the value of the private field without exposing the field itself.',
    ],
  },
  {
    id: 'Q009', concept: 'C002', type: 'Short Answer', difficulty: 'Intermediate',
    text: 'Why might a class provide a deposit() method instead of a public setBalance() method for a BankAccount?',
    answer: 'deposit() can validate the amount (e.g. reject negative values) before changing balance, which setBalance() cannot enforce.',
    explanation: 'Encapsulation protects data integrity. Controlled methods can enforce business rules that direct field access cannot.',
    hints: [
      'Think about what could go wrong if anyone could set the balance to any value.',
      'What if someone calls setBalance(-1000)? A deposit method can prevent this.',
      'The key word is "validation" — deposit() can check the amount before changing the balance.',
    ],
  },
  {
    id: 'Q010', concept: 'C002', type: 'True/False', difficulty: 'Intermediate',
    text: 'Every private field must have both a getter and a setter.',
    answer: 'False',
    explanation: 'A class should expose only what its design requires. A read-only field needs only a getter, or possibly neither.',
    hints: [
      'Think about a field like a social security number — should you be able to change it freely?',
      'Some fields should be read-only, some should be write-only, some neither.',
      'A class exposes only what makes sense for its design — no rule forces both.',
    ],
  },
  {
    id: 'Q011', concept: 'C002', type: 'MCQ', difficulty: 'Advanced',
    text: 'Which principle does encapsulation most directly support?',
    options: [
      'Runtime polymorphism',
      'Information hiding',
      'Multiple inheritance',
      'Method overloading',
    ],
    answer: 'Information hiding',
    explanation: 'Encapsulation hides internal state and implementation details, exposing only a controlled public interface.',
    hints: [
      'Encapsulation is about protecting internal details from the outside.',
      'The concept is about hiding — hiding what?',
      'It hides the internal STATE and IMPLEMENTATION details of a class.',
    ],
  },
  {
    id: 'Q012', concept: 'C002', type: 'Code Output', difficulty: 'Advanced',
    text: 'Will this compile?\n```java\nBankAccount b = new BankAccount();\nb.balance = 500;\n```\nAssume balance is private.',
    answer: 'No — compile error',
    explanation: 'Direct access to a private field from outside the class causes a compile-time error in Java.',
    hints: [
      'What happens when you try to access a private field from outside?',
      'The private modifier prevents direct access — the compiler catches this.',
      'Since balance is private, b.balance = 500 is illegal from outside the BankAccount class.',
    ],
  },

  // C003 — Inheritance
  {
    id: 'Q013', concept: 'C003', type: 'MCQ', difficulty: 'Basic',
    text: 'Which keyword establishes inheritance in Java?',
    options: ['implements', 'inherits', 'extends', 'super'],
    answer: 'extends',
    explanation: "The 'extends' keyword creates an inheritance relationship between a subclass and its parent class.",
    hints: [
      'The keyword literally describes what the child class does to the parent.',
      'class Dog ___ Animal { } — what goes in the blank?',
      'It is a 7-letter keyword meaning "builds upon".',
    ],
  },
  {
    id: 'Q014', concept: 'C003', type: 'True/False', difficulty: 'Basic',
    text: 'A subclass inherits the private fields of its parent class.',
    answer: 'False',
    explanation: 'Private members are not directly accessible in subclasses. They can only be accessed via public or protected methods.',
    hints: [
      'What does "private" mean in terms of access?',
      'Private means only the declaring class itself can access it directly.',
      'The subclass can use inherited public/protected methods to access them indirectly.',
    ],
  },
  {
    id: 'Q015', concept: 'C003', type: 'Short Answer', difficulty: 'Intermediate',
    text: "What does 'is-a' mean in the context of inheritance?",
    answer: 'It means the subclass is a specialized type of the parent. E.g. Dog is-a Animal.',
    explanation: 'Inheritance should represent a genuine is-a relationship, not just code reuse for convenience.',
    hints: [
      'Think about the relationship between Dog and Animal.',
      'Can you say "a Dog IS AN Animal"? That is the is-a test.',
      'If the sentence "[Child] is a [Parent]" makes sense logically, inheritance is appropriate.',
    ],
  },
  {
    id: 'Q016', concept: 'C003', type: 'Code Output', difficulty: 'Intermediate',
    text: 'What does this print?\n```java\nclass Animal { void eat() { System.out.println("Eating"); } }\nclass Dog extends Animal { void bark() { System.out.println("Barking"); } }\nDog d = new Dog();\nd.eat();\n```',
    answer: 'Eating',
    explanation: 'Dog inherits eat() from Animal. Even though eat() is not defined in Dog, it is accessible through inheritance.',
    hints: [
      'Does Dog have an eat() method? If not, where does it come from?',
      'Dog extends Animal, so it inherits all of Animal\'s public/protected methods.',
      'The inherited eat() method prints "Eating".',
    ],
  },
  {
    id: 'Q017', concept: 'C003', type: 'MCQ', difficulty: 'Advanced',
    text: 'Are constructors inherited in Java?',
    options: [
      'Yes, always',
      'No, but subclass can call parent constructor with super()',
      'Yes, if they are public',
      'No, never in any form',
    ],
    answer: 'No, but subclass can call parent constructor with super()',
    explanation: 'Constructors are not inherited, but super() lets the subclass invoke the parent constructor explicitly.',
    hints: [
      'Constructors are special — they are NOT regular methods.',
      'While you cannot inherit a constructor, you can call the parent\'s constructor using a special keyword.',
      'The keyword super() in the first line of a constructor calls the parent\'s constructor.',
    ],
  },
  {
    id: 'Q018', concept: 'C003', type: 'True/False', difficulty: 'Advanced',
    text: 'Java supports multiple class inheritance (a class extending two classes).',
    answer: 'False',
    explanation: 'Java does not allow a class to extend more than one class. Multiple inheritance is supported through interfaces.',
    hints: [
      'Can you write class A extends B, C in Java?',
      'Java chose to avoid the "diamond problem" by limiting class inheritance.',
      'A class can extend only ONE class, but can implement MULTIPLE interfaces.',
    ],
  },

  // C004 — Method Overloading
  {
    id: 'Q019', concept: 'C004', type: 'MCQ', difficulty: 'Basic',
    text: 'What must differ between overloaded methods?',
    options: ['Return type', 'Method name', 'Parameter list', 'Access modifier'],
    answer: 'Parameter list',
    explanation: 'Overloaded methods share a name but must differ in number, type, or order of parameters.',
    hints: [
      'Overloaded methods have the SAME name but DIFFERENT ___.',
      'Think about how the compiler tells them apart when you call them.',
      'The compiler looks at the arguments you pass — these must match different parameter lists.',
    ],
  },
  {
    id: 'Q020', concept: 'C004', type: 'True/False', difficulty: 'Basic',
    text: 'Overloading requires an inheritance relationship between classes.',
    answer: 'False',
    explanation: 'Overloading normally occurs within the same class and does not require inheritance.',
    hints: [
      'Can you have two overloaded methods in the SAME class?',
      'Think about a Calculator class with multiple add() methods.',
      'Overloading works within a single class — no parent/child needed.',
    ],
  },
  {
    id: 'Q021', concept: 'C004', type: 'Code Output', difficulty: 'Intermediate',
    text: 'Which add() is called?\n```java\nint add(int a, int b) { return a+b; }\ndouble add(double a, double b) { return a+b; }\nSystem.out.println(add(2, 3));\n```',
    answer: 'add(int, int) — prints 5',
    explanation: 'Java selects the method based on argument types at compile time. Integer arguments match the int version.',
    hints: [
      'What type are the arguments 2 and 3?',
      'The compiler matches argument types to parameter types to select the overload.',
      '2 and 3 are int literals, so the int version is the exact match.',
    ],
  },
  {
    id: 'Q022', concept: 'C004', type: 'MCQ', difficulty: 'Intermediate',
    text: 'When is an overloaded method selected in Java?',
    options: ['At runtime', 'At compile time', 'When the object is created', 'Never automatically'],
    answer: 'At compile time',
    explanation: 'Method overloading is a compile-time mechanism. The compiler selects the correct overload from the argument types.',
    hints: [
      'Think about WHEN the decision is made — while coding or while running?',
      'The compiler can see the argument types and choose the right version.',
      'This is also called "static polymorphism" because it is resolved statically.',
    ],
  },
  {
    id: 'Q023', concept: 'C004', type: 'Short Answer', difficulty: 'Advanced',
    text: 'Can two methods with the same name and parameters but different return types be considered overloaded?',
    answer: 'No — Java cannot distinguish them by return type alone, so this causes a compile error.',
    explanation: 'Return type alone is not part of the method signature for overloading resolution in Java.',
    hints: [
      'If you call add(2, 3), how would the compiler know which return type you want?',
      'The compiler cannot distinguish methods by return type alone.',
      'The method signature for overloading only includes the name and parameter list, not the return type.',
    ],
  },
  {
    id: 'Q024', concept: 'C004', type: 'True/False', difficulty: 'Advanced',
    text: 'Changing only the access modifier creates a new overloaded method.',
    answer: 'False',
    explanation: 'Access modifier differences alone do not create overloaded methods. The parameter list must differ.',
    hints: [
      'What defines an overloaded method — its visibility or its parameters?',
      'Access modifiers (public, private) are not part of the method signature.',
      'Only the parameter list matters for overloading. Same params + different modifier = error.',
    ],
  },

  // C005 — Method Overriding
  {
    id: 'Q025', concept: 'C005', type: 'Short Answer', difficulty: 'Intermediate',
    text: 'A parent reference holds a child object. Both define the same method. Which implementation runs, and why?',
    answer: 'The child implementation runs because Java selects overridden methods based on the actual object at runtime.',
    explanation: "Runtime polymorphism means the JVM dispatches to the actual object's method, not the reference type's.",
    hints: [
      'Think about what the ACTUAL object is, not what the variable type says.',
      'The JVM looks at the real object in memory at runtime.',
      'Animal a = new Dog(); — the reference is Animal, but the object is Dog. The Dog version runs.',
    ],
  },
  {
    id: 'Q026', concept: 'C005', type: 'MCQ', difficulty: 'Basic',
    text: 'What is required for method overriding?',
    options: [
      'Different method name',
      'Same signature in subclass via inheritance',
      'Same class only',
      'Private method in parent',
    ],
    answer: 'Same signature in subclass via inheritance',
    explanation: 'Overriding needs inheritance and the same method name, parameter list, and compatible return type.',
    hints: [
      'Overriding means a child class provides its OWN version of a parent method.',
      'The child method must match the parent method exactly in name and parameters.',
      'This requires two classes with an inheritance relationship.',
    ],
  },
  {
    id: 'Q027', concept: 'C005', type: 'True/False', difficulty: 'Basic',
    text: 'The @Override annotation is required for overriding to work.',
    answer: 'False',
    explanation: '@Override is optional but recommended. It tells the compiler to verify the override is valid.',
    hints: [
      'Would overriding work if you simply wrote the same method without any annotation?',
      '@Override is a safety check for the programmer, not a requirement for Java.',
      'It is optional but recommended — it catches typos in method names at compile time.',
    ],
  },
  {
    id: 'Q028', concept: 'C005', type: 'Code Output', difficulty: 'Intermediate',
    text: 'What prints?\n```java\nclass Animal { void sound() { System.out.println("Animal"); } }\nclass Dog extends Animal { void sound() { System.out.println("Bark"); } }\nAnimal a = new Dog();\na.sound();\n```',
    answer: 'Bark',
    explanation: "The actual object is a Dog. Runtime polymorphism selects Dog's overriding sound() method.",
    hints: [
      "Think about which object was actually created with 'new'.",
      'Consider how runtime polymorphism selects between parent and child methods.',
      'The variable type is Animal, but the object created was a Dog — which sound() runs?',
    ],
  },
  {
    id: 'Q029', concept: 'C005', type: 'MCQ', difficulty: 'Advanced',
    text: 'Can a private method in a parent class be overridden?',
    options: [
      'Yes',
      'No — private methods are not inherited',
      'Only with @Override',
      'Only in the same package',
    ],
    answer: 'No — private methods are not inherited',
    explanation: 'Private methods are not visible to subclasses, so they cannot be overridden. A subclass can define an identical method, but it is independent.',
    hints: [
      'What does "private" mean for visibility in subclasses?',
      'If the child class cannot even see the method, can it override it?',
      'Private methods are invisible to subclasses — the child defines a completely NEW method.',
    ],
  },
  {
    id: 'Q030', concept: 'C005', type: 'Short Answer', difficulty: 'Advanced',
    text: 'What is the difference between overriding and hiding a static method in Java?',
    answer: 'Overriding uses runtime dispatch on instance methods. Static methods are hidden, not overridden — the reference type determines which static method runs.',
    explanation: 'Static methods belong to the class, not the object. They are resolved at compile time, so they are hidden, not overridden.',
    hints: [
      'Think about whether static methods belong to the object or the class.',
      'Static methods are resolved at compile time, not runtime.',
      'For static methods, the REFERENCE TYPE determines which runs. For instance methods, the OBJECT TYPE determines which runs.',
    ],
  },

  // C006 — Polymorphism
  {
    id: 'Q031', concept: 'C006', type: 'MCQ', difficulty: 'Basic',
    text: 'What does polymorphism allow a parent reference to do?',
    options: [
      'Only call parent methods',
      'Refer to objects of different child classes',
      'Prevent overriding',
      'Access private child fields',
    ],
    answer: 'Refer to objects of different child classes',
    explanation: 'Polymorphism lets one reference type work with multiple object types, enabling flexible and extensible design.',
    hints: [
      'The word "poly" means many, "morph" means forms.',
      'Can Animal a = new Dog() and Animal a = new Cat() both work?',
      'A parent reference can hold ANY child object — that is polymorphism.',
    ],
  },
  {
    id: 'Q032', concept: 'C006', type: 'True/False', difficulty: 'Basic',
    text: 'Runtime polymorphism in Java requires method overriding.',
    answer: 'True',
    explanation: 'Runtime polymorphism depends on overridden instance methods being dispatched according to the actual object.',
    hints: [
      'Runtime polymorphism is about the JVM choosing which method to run.',
      'For the JVM to choose, there must be multiple versions of the same method.',
      'Overriding creates those multiple versions across parent and child classes.',
    ],
  },
  {
    id: 'Q033', concept: 'C006', type: 'Code Output', difficulty: 'Intermediate',
    text: "What prints?\n```java\nAnimal a1 = new Dog();\nAnimal a2 = new Cat();\na1.sound();\na2.sound();\n```\nDog.sound() prints 'Bark', Cat.sound() prints 'Meow'.",
    answer: 'Bark\nMeow',
    explanation: "Each object's overriding method is selected at runtime. a1 holds a Dog, a2 holds a Cat.",
    hints: [
      'What objects were actually created with new?',
      'a1 is a Dog, a2 is a Cat — each has its own sound().',
      'Runtime polymorphism: Dog.sound() prints Bark, Cat.sound() prints Meow.',
    ],
  },
  {
    id: 'Q034', concept: 'C006', type: 'Short Answer', difficulty: 'Intermediate',
    text: 'Explain the difference between compile-time and runtime polymorphism in Java.',
    answer: 'Compile-time: method overloading, resolved by compiler from argument types. Runtime: method overriding, resolved by JVM from actual object type.',
    explanation: 'The key distinction is when the method selection occurs and what mechanism drives it.',
    hints: [
      'One is decided by the compiler, the other by the JVM at runtime.',
      'Overloading = compile-time (static), Overriding = runtime (dynamic).',
      'Compile-time looks at argument types; runtime looks at the actual object created with new.',
    ],
  },
  {
    id: 'Q035', concept: 'C006', type: 'MCQ', difficulty: 'Advanced',
    text: 'Which determines what methods you can CALL on a reference in Java?',
    options: ['Actual object type', 'Reference type', 'Both equally', 'Neither'],
    answer: 'Reference type',
    explanation: 'The reference type controls what methods are accessible at compile time. The actual object type determines which override runs at runtime.',
    hints: [
      'Think about what the compiler checks when you write a.someMethod().',
      'The compiler only knows the declared type of the variable.',
      'Reference type = what you can call. Object type = which version runs.',
    ],
  },
  {
    id: 'Q036', concept: 'C006', type: 'True/False', difficulty: 'Advanced',
    text: 'Polymorphism only works with classes, not interfaces.',
    answer: 'False',
    explanation: 'Interfaces are a primary mechanism for polymorphism in Java. A reference type can be an interface pointing to any implementing object.',
    hints: [
      'Can you declare a variable of an interface type?',
      'Think about List<String> list = new ArrayList<>(); — List is an interface.',
      'Interfaces are actually one of the MAIN ways polymorphism is used in Java.',
    ],
  },
];
