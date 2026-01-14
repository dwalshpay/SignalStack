import { CONSUMER_EMAIL_DOMAINS } from '../constants';

export type NegativeKeywordCategory = 'consumer_email' | 'job_seeker' | 'student' | 'free_seeker' | 'informational';
export type ExportFormat = 'plain' | 'google_editor' | 'meta';

export interface NegativeKeywordList {
  category: NegativeKeywordCategory;
  label: string;
  keywords: string[];
}

/**
 * Base negative keywords that apply to most B2B campaigns
 */
export const BASE_NEGATIVES: NegativeKeywordList = {
  category: 'free_seeker',
  label: 'Free/Discount Seekers',
  keywords: [
    'free',
    'cheap',
    'cheapest',
    'discount',
    'coupon',
    'coupon code',
    'promo code',
    'deal',
    'deals',
    'diy',
    'do it yourself',
    'personal',
    'home use',
    'individual',
    'budget',
  ],
};

/**
 * Job seeker negative keywords
 */
export const JOB_SEEKER_NEGATIVES: NegativeKeywordList = {
  category: 'job_seeker',
  label: 'Job Seekers',
  keywords: [
    'jobs',
    'job',
    'careers',
    'career',
    'hiring',
    'employment',
    'salary',
    'salaries',
    'resume',
    'cv',
    'cover letter',
    'interview',
    'training',
    'course',
    'certification',
    'certifications',
    'how to become',
    'qualifications',
  ],
};

/**
 * Student negative keywords
 */
export const STUDENT_NEGATIVES: NegativeKeywordList = {
  category: 'student',
  label: 'Students/Academic',
  keywords: [
    'student',
    'students',
    'university',
    'college',
    'assignment',
    'homework',
    'thesis',
    'essay',
    'research paper',
    'academic',
    'study guide',
    'tutorial',
    'learn',
    'learning',
    'beginner',
    'beginners guide',
  ],
};

/**
 * Informational search negative keywords
 */
export const INFORMATIONAL_NEGATIVES: NegativeKeywordList = {
  category: 'informational',
  label: 'Informational Searches',
  keywords: [
    'what is',
    'how to',
    'how do',
    'definition',
    'meaning',
    'example',
    'examples',
    'template free',
    'free template',
    'sample',
    'samples',
    'vs',
    'versus',
    'comparison',
    'difference between',
    'explain',
    'wiki',
    'wikipedia',
  ],
};

/**
 * Generate email domain negatives from the consumer blocklist
 */
export function generateEmailDomainNegatives(): NegativeKeywordList {
  const allDomains = [
    ...CONSUMER_EMAIL_DOMAINS.global,
    ...CONSUMER_EMAIL_DOMAINS.australia,
    ...CONSUMER_EMAIL_DOMAINS.regional,
  ];

  return {
    category: 'consumer_email',
    label: 'Consumer Email Domains',
    keywords: allDomains.map((domain) => `@${domain}`),
  };
}

/**
 * Get all negative keyword lists
 */
export function getAllNegativeKeywordLists(): NegativeKeywordList[] {
  return [
    BASE_NEGATIVES,
    JOB_SEEKER_NEGATIVES,
    STUDENT_NEGATIVES,
    INFORMATIONAL_NEGATIVES,
    generateEmailDomainNegatives(),
  ];
}

/**
 * Export keywords in plain text format (one per line)
 */
export function exportPlainText(lists: NegativeKeywordList[]): string {
  const sections = lists.map((list) => {
    return `# ${list.label}\n${list.keywords.join('\n')}`;
  });

  return sections.join('\n\n');
}

/**
 * Export keywords in Google Ads Editor format
 * Format: Campaign/Ad Group, Keyword, Match Type
 */
export function exportGoogleAdsEditor(
  lists: NegativeKeywordList[],
  campaignName: string = '[Campaign Name]',
  matchType: 'Broad' | 'Phrase' | 'Exact' = 'Phrase'
): string {
  const header = 'Campaign,Keyword,Match Type';
  const rows: string[] = [];

  for (const list of lists) {
    for (const keyword of list.keywords) {
      // Escape keywords with special characters
      const escapedKeyword = keyword.includes(',') ? `"${keyword}"` : keyword;
      rows.push(`${campaignName},${escapedKeyword},${matchType}`);
    }
  }

  return [header, ...rows].join('\n');
}

/**
 * Export keywords for Meta Ads (one per line, no formatting)
 */
export function exportMetaFormat(lists: NegativeKeywordList[]): string {
  const allKeywords: string[] = [];

  for (const list of lists) {
    // Skip email domains for Meta (not supported the same way)
    if (list.category === 'consumer_email') continue;
    allKeywords.push(...list.keywords);
  }

  // Remove duplicates and sort
  const unique = [...new Set(allKeywords)].sort();
  return unique.join('\n');
}

/**
 * Get keyword counts by category
 */
export function getKeywordCounts(lists: NegativeKeywordList[]): Record<NegativeKeywordCategory, number> {
  return lists.reduce(
    (acc, list) => {
      acc[list.category] = list.keywords.length;
      return acc;
    },
    {} as Record<NegativeKeywordCategory, number>
  );
}

/**
 * Combine selected lists into a single export
 */
export function exportNegativeKeywords(
  selectedCategories: NegativeKeywordCategory[],
  format: ExportFormat,
  campaignName?: string
): string {
  const allLists = getAllNegativeKeywordLists();
  const selectedLists = allLists.filter((list) => selectedCategories.includes(list.category));

  switch (format) {
    case 'google_editor':
      return exportGoogleAdsEditor(selectedLists, campaignName);
    case 'meta':
      return exportMetaFormat(selectedLists);
    case 'plain':
    default:
      return exportPlainText(selectedLists);
  }
}
