/**
 * Rule-based NLP Engine for complaint analysis
 * Analyzes text to detect priority, category, and sentiment
 */

const PRIORITY_KEYWORDS = {
  Critical: [
    'emergency', 'urgent', 'critical', 'danger', 'fire', 'flood', 'accident',
    'injury', 'bleeding', 'collapse', 'explosion', 'threat', 'violence', 'assault',
    'immediately', 'life-threatening', 'severe', 'crisis'
  ],
  High: [
    'broken', 'not working', 'failed', 'failure', 'serious', 'major', 'important',
    'asap', 'quickly', 'soon', 'problem', 'issue', 'cannot', 'unable', 'blocked',
    'harassment', 'discrimination', 'unsafe', 'hazard', 'leak', 'damage'
  ],
  Medium: [
    'inconvenient', 'slow', 'delay', 'need', 'require', 'request', 'concern',
    'complaint', 'issue', 'trouble', 'difficult', 'poor', 'bad', 'wrong'
  ],
  Low: [
    'suggestion', 'feedback', 'minor', 'small', 'little', 'improve', 'enhancement',
    'nice to have', 'when possible', 'eventually', 'consider'
  ]
};

const CATEGORY_KEYWORDS = {
  Infrastructure: [
    'building', 'wall', 'roof', 'floor', 'door', 'window', 'electricity', 'power',
    'water', 'pipe', 'plumbing', 'toilet', 'bathroom', 'light', 'fan', 'ac',
    'air conditioning', 'lift', 'elevator', 'parking', 'road', 'path', 'construction'
  ],
  Academic: [
    'class', 'lecture', 'professor', 'teacher', 'faculty', 'course', 'exam',
    'grade', 'marks', 'assignment', 'syllabus', 'curriculum', 'timetable',
    'schedule', 'attendance', 'result', 'certificate', 'degree', 'lab'
  ],
  Administrative: [
    'fee', 'payment', 'document', 'certificate', 'admission', 'registration',
    'office', 'staff', 'administration', 'form', 'application', 'scholarship',
    'refund', 'receipt', 'id card', 'identity'
  ],
  Hostel: [
    'hostel', 'room', 'dormitory', 'dorm', 'bed', 'mattress', 'mess', 'food',
    'canteen', 'warden', 'roommate', 'laundry', 'washing', 'curfew', 'visitor'
  ],
  Library: [
    'library', 'book', 'journal', 'magazine', 'reading', 'study room', 'librarian',
    'catalog', 'borrow', 'return', 'fine', 'digital', 'e-book', 'database'
  ],
  'IT Support': [
    'computer', 'laptop', 'internet', 'wifi', 'network', 'software', 'hardware',
    'printer', 'scanner', 'email', 'password', 'login', 'system', 'website',
    'portal', 'app', 'application', 'server', 'database', 'it'
  ],
  Safety: [
    'safety', 'security', 'guard', 'cctv', 'camera', 'theft', 'stolen', 'lost',
    'missing', 'suspicious', 'harassment', 'bully', 'ragging', 'abuse', 'threat'
  ]
};

const NEGATIVE_SENTIMENT_WORDS = [
  'terrible', 'horrible', 'awful', 'disgusting', 'unacceptable', 'pathetic',
  'worst', 'useless', 'incompetent', 'negligent', 'irresponsible', 'frustrated',
  'angry', 'furious', 'disappointed', 'disgusted', 'outraged', 'fed up'
];

const POSITIVE_SENTIMENT_WORDS = [
  'good', 'great', 'excellent', 'satisfied', 'happy', 'pleased', 'thankful',
  'grateful', 'appreciate', 'helpful', 'resolved', 'fixed', 'improved'
];

/**
 * Tokenize and normalize text
 */
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

/**
 * Calculate sentiment score (-1 to 1)
 */
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  let score = 0;

  NEGATIVE_SENTIMENT_WORDS.forEach(word => {
    if (lower.includes(word)) score -= 0.15;
  });

  POSITIVE_SENTIMENT_WORDS.forEach(word => {
    if (lower.includes(word)) score += 0.1;
  });

  // Exclamation marks indicate intensity
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 0) score -= exclamations * 0.05;

  // ALL CAPS words indicate urgency/anger
  const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
  if (capsWords > 0) score -= capsWords * 0.1;

  return Math.max(-1, Math.min(1, score));
}

/**
 * Detect priority from text
 */
function detectPriority(text, sentimentScore) {
  const lower = text.toLowerCase();
  const scores = { Critical: 0, High: 0, Medium: 0, Low: 0 };

  Object.entries(PRIORITY_KEYWORDS).forEach(([priority, keywords]) => {
    keywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        scores[priority] += 1;
      }
    });
  });

  // Boost priority based on negative sentiment
  if (sentimentScore < -0.3) scores.High += 2;
  if (sentimentScore < -0.6) scores.Critical += 2;

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'Medium';

  return Object.keys(scores).find(k => scores[k] === maxScore) || 'Medium';
}

/**
 * Suggest category from text
 */
function suggestCategory(text) {
  const lower = text.toLowerCase();
  const scores = {};

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    scores[category] = 0;
    keywords.forEach(keyword => {
      if (lower.includes(keyword)) scores[category] += 1;
    });
  });

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'Other';

  return Object.keys(scores).find(k => scores[k] === maxScore) || 'Other';
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  const tokens = tokenize(text);
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'of', 'for', 'it', 'this', 'that', 'was', 'are',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'not',
    'no', 'my', 'our', 'your', 'their', 'we', 'they', 'he', 'she', 'i'
  ]);

  const freq = {};
  tokens.forEach(token => {
    if (!stopWords.has(token) && token.length > 2) {
      freq[token] = (freq[token] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Main NLP analysis function
 */
function analyzeComplaint(title, description) {
  const fullText = `${title} ${description}`;
  const sentimentScore = analyzeSentiment(fullText);
  const detectedPriority = detectPriority(fullText, sentimentScore);
  const suggestedCategory = suggestCategory(fullText);
  const keywords = extractKeywords(fullText);
  const escalationFlag = sentimentScore < -0.4 || detectedPriority === 'Critical';

  return {
    detectedPriority,
    suggestedCategory,
    sentimentScore: parseFloat(sentimentScore.toFixed(3)),
    keywords,
    escalationFlag
  };
}

module.exports = { analyzeComplaint };
