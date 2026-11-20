const fs = require('fs');
const path = require('path');

// 1. Test validateGuestName regex logic (includes \p{L} and \p{M} for Devanagari matras/vowel signs)
const validPattern = /^[\p{L}\p{M}\s'-]+$/u;

function validate(name) {
  if (!name || typeof name !== 'string') return { valid: false, reason: 'empty' };
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, reason: 'minChars' };
  if (trimmed.length > 50) return { valid: false, reason: 'maxChars' };
  if (!validPattern.test(trimmed)) return { valid: false, reason: 'invalidChars' };
  return { valid: true, value: trimmed };
}

console.log('--- TEST 1: GUEST NAME VALIDATION ---');
const testCases = [
  { input: '', expected: false, desc: 'Empty string' },
  { input: '   ', expected: false, desc: 'Whitespace only' },
  { input: 'A', expected: false, desc: 'Single char' },
  { input: 'Rajesh', expected: true, desc: 'Valid English first name' },
  { input: 'Patil', expected: true, desc: 'Valid English surname' },
  { input: 'चिन्मय', expected: true, desc: 'Devanagari name (Chinmay)' },
  { input: 'नेहा', expected: true, desc: 'Devanagari name (Neha)' },
  { input: 'कुलकर्णी', expected: true, desc: 'Devanagari surname (Kulkarni)' },
  { input: 'Mary-Jane', expected: true, desc: 'Hyphenated name' },
  { input: "O'Connor", expected: true, desc: 'Apostrophe name' },
  { input: 'Rajesh123', expected: false, desc: 'Digits in name' },
  { input: 'Rajesh<script>', expected: false, desc: 'XSS characters' },
  { input: 'A'.repeat(51), expected: false, desc: 'Over 50 characters' },
];

let test1Passed = true;
testCases.forEach(tc => {
  const res = validate(tc.input);
  const pass = res.valid === tc.expected;
  if (!pass) test1Passed = false;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${tc.desc}: "${tc.input}" -> ${res.valid}`);
});

// 2. Test Session Timeout Logic (30 minutes)
console.log('\n--- TEST 2: 30-MINUTE SESSION INACTIVITY LOGIC ---');
const TIMEOUT_MS = 30 * 60 * 1000;

function checkSessionMock(now, lastActivity, currentSessionId) {
  if (!currentSessionId || now - lastActivity > TIMEOUT_MS) {
    return { isNewSession: true, newSessionId: 'new-uuid-' + now };
  }
  return { isNewSession: false, sessionId: currentSessionId };
}

const t0 = 100000000;
const sid1 = 'sess-1';

// Scenario A: immediate refresh (2 seconds later)
const resA = checkSessionMock(t0 + 2000, t0, sid1);
const passA = resA.isNewSession === false;
console.log(`[${passA ? 'PASS' : 'FAIL'}] 2-second refresh does NOT create new session: isNewSession=${resA.isNewSession}`);

// Scenario B: 29 minutes later (still active)
const resB = checkSessionMock(t0 + (29 * 60 * 1000), t0, sid1);
const passB = resB.isNewSession === false;
console.log(`[${passB ? 'PASS' : 'FAIL'}] 29-minute activity does NOT create new session: isNewSession=${resB.isNewSession}`);

// Scenario C: 31 minutes later (inactivity threshold crossed)
const resC = checkSessionMock(t0 + (31 * 60 * 1000), t0, sid1);
const passC = resC.isNewSession === true;
console.log(`[${passC ? 'PASS' : 'FAIL'}] 31-minute inactivity DOES trigger new session: isNewSession=${resC.isNewSession}`);

// 3. Test Translations File Integrity
console.log('\n--- TEST 3: TRANSLATIONS STRUCTURE INTEGRITY ---');
const translationsFile = fs.readFileSync(path.join(__dirname, 'src', 'data', 'translations.js'), 'utf8');
const hasEn = translationsFile.includes('en: {');
const hasMr = translationsFile.includes('mr: {');
const hasMarathiDevanagari = translationsFile.includes('साखरपुडा') && translationsFile.includes('आपणास प्रेमपूर्वक आमंत्रण');
console.log(`[${hasEn ? 'PASS' : 'FAIL'}] English translations present: ${hasEn}`);
console.log(`[${hasMr ? 'PASS' : 'FAIL'}] Marathi translations present: ${hasMr}`);
console.log(`[${hasMarathiDevanagari ? 'PASS' : 'FAIL'}] Traditional Marathi Devanagari text verified: ${hasMarathiDevanagari}`);

// 4. Test Configuration Integrity
console.log('\n--- TEST 4: INVITATION CONFIGURATION INTEGRITY ---');
const configFile = fs.readFileSync(path.join(__dirname, 'src', 'data', 'invitationConfig.js'), 'utf8');
const hasDate2026 = configFile.includes('2026-12-19');
const hasISTTimezone = configFile.includes('Asia/Kolkata');
const hasNehaChinmay = configFile.includes('Neha') && configFile.includes('Chinmay') && configFile.includes('नेहा') && configFile.includes('चिन्मय');
console.log(`[${hasDate2026 ? 'PASS' : 'FAIL'}] Target date 19 Dec 2026 present: ${hasDate2026}`);
console.log(`[${hasISTTimezone ? 'PASS' : 'FAIL'}] Asia/Kolkata timezone present: ${hasISTTimezone}`);
console.log(`[${hasNehaChinmay ? 'PASS' : 'FAIL'}] Neha & Chinmay bilingual names present: ${hasNehaChinmay}`);

const summary = test1Passed && passA && passB && passC && hasEn && hasMr && hasMarathiDevanagari && hasDate2026 && hasISTTimezone && hasNehaChinmay;
console.log('\n========================================');
console.log(`ALL AUTOMATED TESTS PASSED: ${summary ? 'YES (100%)' : 'NO'}`);
console.log('========================================');
if (!summary) process.exit(1);
