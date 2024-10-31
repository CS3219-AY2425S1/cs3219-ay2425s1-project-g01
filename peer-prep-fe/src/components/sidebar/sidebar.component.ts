import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Question, Example } from '../../app/models/question.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule],
})

// need to create a function that returns a colour to a specific category
export class SidebarComponent {
  tags = [
    { name: 'Dynamic Programming', color: 'navy' },
    { name: 'Hash Table', color: 'green' }
  ];

  question: Question = {
    question_id: '1',
    question_title: 'Longest Increasing Subsequence',
    question_description: `Given an integer array nums, return the length of the longest strictly increasing subsequence. 
    A subsequence is a sequence that can be derived from the given sequence by deleting some or no elements without changing the relative order of the remaining characters.`,
    question_categories: this.tags.map(tag => tag.name),
    question_complexity: 'Hard',
    examples: [
      { input: 'nums = [9,1,4,2,3,3,7]', output: '4' },
      { input: 'nums = [0,3,1,3,2,3]', output: '4' }
    ],
    constraints: [
      '1 <= nums.length <= 1000',
      '-1000 <= nums[i] <= 1000'
    ]
  };

  // getRandomColor(): string {
  //   const letters = '0123456789ABCDEF';
  //   let color = '#';
  //   for (let i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }

  getFormattedDescription(): string {
    return this.question.question_description.split('. ').join('.<br><br>'); 
}

}
