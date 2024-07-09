const SUBJECTS_BY_SEMESTER = {
  1: [ ["HS3152", 3], ["MA3151", 4], ["PH3151", 3], ["CY3151", 3], ["GE3151", 3], ["GE3171", 2], ["BS3171", 2] ],
  2: [ ["HS3252", 2], ["MA3251", 4], ["PH3254", 3], ["BE3254", 3], ["GE3251", 4], ["EC3251", 4], ["GE3271", 2], ["EC3271", 1] ],
  3: [ ["MA3355", 4], ["CS3353", 3], ["EC3354", 4], ["EC3353", 3], ["EC3351", 3], ["EC3352", 4], ["EC3361", 1.5], ["CS3362", 1.5], ["GE3361", 1] ],
  4: [ ["EC3452", 3], ["EC3401", 4], ["EC3451", 3], ["EC3492", 4], ["EC3491", 3], ["GE3451", 2], ["EC3461", 1.5], ["EC3462", 1.5] ],
  5: [ ["EC3501", 4], ["EC3552", 3], ["EC3551", 3], ["CEC345", 3], ["CEC331", 3], ["CEC354", 3], ["EC3561", 2] ],
  6: [ ["ET3491", 4], ["CS3491", 4], ["CEC371", 3], ["CEC364", 3], ["OAS351", 3], ["CEC333", 3], ["GE3152", 1], ["GE3252", 1] ],
  7: [ ["MAT401", 3], ["PHY401", 3], ["CHE401", 3], ["CSE401", 3], ["ENG401", 3], ["BIO401", 3] ],
  8: [ ["MAT402", 3], ["PHY402", 3], ["CHE402", 3], ["CSE402", 3], ["ENG402", 3], ["BIO402", 3] ],
};

let currentSemester = null;
let cgpaPrevSem = 0;
let courses = [];

document.addEventListener('DOMContentLoaded', () => {
  const semesterButtonsContainer = document.getElementById('semester-buttons');
  for (let sem = 1; sem <= 8; sem++) {
      const button = document.createElement('button');
      button.innerText = `Semester ${sem}`;
      button.addEventListener('click', () => openCgpaCalculator(sem));
      semesterButtonsContainer.appendChild(button);
  }

  document.getElementById('input-cgpa-button').addEventListener('click', inputCgpa);
  document.getElementById('add-course-button').addEventListener('click', addCourse);
  document.getElementById('calculate-button').addEventListener('click', calculateGpaCgpa);
  document.getElementById('back-button').addEventListener('click', goBack);
});

function openCgpaCalculator(semester) {
  currentSemester = semester;
  document.querySelector('.container > h1').classList.add('hidden');
  document.getElementById('semester-buttons').classList.add('hidden');
  document.getElementById('cgpa-calculator').classList.remove('hidden');
  document.getElementById('semester-title').innerText = `CGPA Calculator - Semester ${semester}`;

  if (semester > 1) {
      document.getElementById('cgpa-input-section').classList.remove('hidden');
  } else {
      document.getElementById('cgpa-input-section').classList.add('hidden');
  }

  addPredefinedCourses(semester);
}

function inputCgpa() {
  cgpaPrevSem = parseFloat(prompt(`Enter your CGPA till semester ${currentSemester - 1}:`, '0.0'));
  if (isNaN(cgpaPrevSem) || cgpaPrevSem < 0 || cgpaPrevSem > 10) {
      alert('Please enter a valid CGPA between 0 and 10.');
      cgpaPrevSem = 0;
  }
  document.getElementById('cgpa-label').innerText = `CGPA till Sem ${currentSemester - 1}: ${cgpaPrevSem.toFixed(4)}`;
}

function addPredefinedCourses(semester) {
  const coursesSection = document.getElementById('courses-section');
  coursesSection.innerHTML = '';
  courses = [];

  const predefinedCourses = SUBJECTS_BY_SEMESTER[semester] || [];
  predefinedCourses.forEach(([name, credits]) => addCourse(name, credits));
}

function addCourse(name = '', credits = 0) {
  const courseRow = document.createElement('div');
  courseRow.className = 'course-row';

  const nameInput = document.createElement('input');
  nameInput.value = name;
  courseRow.appendChild(nameInput);

  const creditsInput = document.createElement('input');
  creditsInput.value = credits;
  courseRow.appendChild(creditsInput);

  const grades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'U'];
  grades.forEach(grade => {
      const gradeButton = document.createElement('button');
      gradeButton.className = 'grade-button';
      gradeButton.innerText = grade;
      gradeButton.addEventListener('click', () => selectGrade(courseRow, grade));
      courseRow.appendChild(gradeButton);
  });

  const removeButton = document.createElement('button');
  removeButton.innerText = 'Remove';
  removeButton.addEventListener('click', () => {
      courseRow.remove();
      courses = courses.filter(course => course.row !== courseRow);
  });
  courseRow.appendChild(removeButton);

  document.getElementById('courses-section').appendChild(courseRow);
  courses.push({ row: courseRow, nameInput, creditsInput, grade: 'O' });

  selectGrade(courseRow, 'O');
}

function selectGrade(courseRow, grade) {
  const gradeButtons = courseRow.querySelectorAll('.grade-button');
  gradeButtons.forEach(button => {
      button.classList.toggle('selected', button.innerText === grade);
  });

  const course = courses.find(c => c.row === courseRow);
  if (course) {
      course.grade = grade;
  }
}

function calculateGpaCgpa() {
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach(course => {
      const credits = parseFloat(course.creditsInput.value);
      if (isNaN(credits) || credits <= 0) {
          alert('Please enter valid credits.');
          return;
      }

      const grade = course.grade;
      if (grade === 'U') return;  // Skip courses with grade 'U'

      const gradePoint = gradeToPoint(grade);
      if (gradePoint === null) {
          alert('Please select a valid grade.');
          return;
      }

      totalPoints += gradePoint * credits;
      totalCredits += credits;
  });

  if (totalCredits === 0) {
      alert('Total credit hours cannot be zero.');
      return;
  }

  const gpaCurrSem = (totalPoints / totalCredits).toFixed(4);
  let resultText = `GPA for Sem ${currentSemester}: ${gpaCurrSem}`;

  if (currentSemester > 1) {
      const newCgpa = (((currentSemester - 1) * cgpaPrevSem + parseFloat(gpaCurrSem)) / currentSemester).toFixed(4);
      resultText += `\nNew CGPA after Sem ${currentSemester}: ${newCgpa}`;
  }

  document.getElementById('result').innerText = resultText;
}

function gradeToPoint(grade) {
  const gradeMap = { 'O': 10.0, 'A+': 9.0, 'A': 8.0, 'B+': 7.0, 'B': 6.0, 'C': 5.0, 'U': 0.0 };
  return gradeMap[grade] || null;
}

function goBack() {
  document.querySelector('.container > h1').classList.remove('hidden');
  document.getElementById('semester-buttons').classList.remove('hidden');
  document.getElementById('cgpa-calculator').classList.add('hidden');
}
