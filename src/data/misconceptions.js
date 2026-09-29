// Misconception detection bank
export const misconceptionBank = [
  { id: 'M001', concept: 'C001', trigger: ['same thing', 'same as object', 'no difference', 'identical'],
    description: 'Learner thinks class and object are the same' },
  { id: 'M002', concept: 'C001', trigger: ['automatically', 'just declaring', 'without new', 'declare creates'],
    description: 'Learner thinks declaring a variable creates an object' },
  { id: 'M003', concept: 'C002', trigger: ['getter and setter', 'must have both', 'always need both', 'every field needs'],
    description: 'Learner thinks every field needs getter AND setter' },
  { id: 'M004', concept: 'C002', trigger: ['same class', 'all in one', 'one class', 'single class'],
    description: 'Learner thinks encapsulation means putting all code in one class' },
  { id: 'M005', concept: 'C003', trigger: ['copies', 'duplicate', 'paste', 'copied into'],
    description: 'Learner thinks inheritance copies code into the subclass' },
  { id: 'M006', concept: 'C003', trigger: ['private', 'all members', 'everything inherited', 'inherits private'],
    description: 'Learner thinks all parent members including private are inherited' },
  { id: 'M007', concept: 'C004', trigger: ['return type', 'different return', 'return value only'],
    description: 'Learner thinks different return type alone creates overloading' },
  { id: 'M008', concept: 'C004', trigger: ['inheritance', 'extends needed', 'parent class', 'needs extends'],
    description: 'Learner thinks overloading requires inheritance' },
  { id: 'M009', concept: 'C005', trigger: ['different parameters', 'parameter list differs', 'different params'],
    description: 'Learner confuses overriding with overloading' },
  { id: 'M010', concept: 'C005', trigger: ['parent method', 'reference type', 'variable type', 'declared type runs'],
    description: 'Learner thinks reference type determines which overridden method runs' },
  { id: 'M011', concept: 'C006', trigger: ['only classes', 'not interfaces', 'no interfaces', 'classes only'],
    description: 'Learner thinks polymorphism only works with classes' },
  { id: 'M012', concept: 'C006', trigger: ['compile time', 'compiler decides', 'static resolution', 'compile resolves'],
    description: 'Learner thinks runtime polymorphism is resolved at compile time' },
];

// Detect misconceptions from learner's answer
export function detectMisconception(concept, learnerAnswer) {
  if (!learnerAnswer) return null;
  const answer = learnerAnswer.toLowerCase();
  
  const matches = misconceptionBank.filter(m => 
    m.concept === concept && 
    m.trigger.some(t => answer.includes(t.toLowerCase()))
  );
  
  return matches.length > 0 ? matches[0] : null;
}

// Detect misconception from MCQ selection
export function detectMisconceptionFromOption(concept, selectedOption, correctAnswer) {
  if (selectedOption === correctAnswer) return null;
  return detectMisconception(concept, selectedOption);
}
