// export interface Question {
//   question_id: string
//   question_title: string
//   question_description: string
//   question_categories: string[]
//   question_complexity: string
// }

export interface Example {
  input: string;
  output: string;
}

export interface Question {
  question_id: string;
  question_title: string;
  question_description: string;
  question_categories: string[];
  question_complexity: string;
  examples: Example[]; // Add examples
  constraints: string[]; // Add constraints
}
