const courseQ = 'ba';
let regexStr = `\\b${courseQ.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`;
if (courseQ === 'ba') regexStr = '\\b(ba|b\\.a\\.?|bachelor of arts)\\b';

console.log("regex string:", regexStr);
const courseRegex = new RegExp(regexStr, 'i');

console.log('Bachelor of Engineering:', courseRegex.test('Bachelor of Engineering'));
console.log('BA:', courseRegex.test('BA'));
console.log('B.A.', courseRegex.test('B.A.'));
console.log('Bachelor of Arts:', courseRegex.test('Bachelor of Arts'));
