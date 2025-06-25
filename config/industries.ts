export interface IndustryConfig {
  id: string;
  name: string;
  displayName: string;
  targetAudience: string;
  contexts: string[];
  voiceAdjustments: {
    industrySpecificTerms: string[];
    commonMyths: string[];
    expertTypes: string[];
    industryName: string;
  };
}

export const INDUSTRIES: Record<string, IndustryConfig> = {
  'self-help': {
    id: 'self-help',
    name: 'self-help',
    displayName: 'Self-Help',
    targetAudience: 'people buying self-help books',
    contexts: [
      "The [Number] format (7)",
      "F*ck/Sh*t trend (VERY sparingly - maybe 20% of titles)",
      "productivity obsession",
      "Secrets of... (class problem-solver setup)",
      "How to...",
      "hustle culture",
      "The Art of...",
      "Everything You Need to Know About...",
      "The Science of...",
      "Why...",
      "[Millionaire/Billionaire] (Wealth)",
      "...for Dummies/Idiots/Beginners",
      "(wellness trends and expensive supplements)",
      "The Power of...",
      "Not Giving a...",
      "...That Will Change Your Life Forever",
      "The [Number}-[Time] (Minute/Hour/Day/Week/Month) [Solution]",
      "(crypto bros or financial freedom)",
      "(personal branding and thought leadership)",
      "From Zero to Hero",
      "The Ultimate Guide",
      "(identity aspirational formula)",
      "Win at Life (vague outcome promise)",
      "(biohacking)",
      "The [Adjective] [Method/System/Guide]",
      "What [Group] Doesn't Want You to Know",
      "The [Adjective] [Topic] Revolution",
      "(startup culture and failing upward)",
      "The [Adjective] Way to [Result]",
      "(cultural anxiety / chaos trope)",
      "(pseudo-wisdom name-dropping)",
      "(Tony-Robbins-meets-Instagram motif)",
      "(Morning routine fetishism)",
      "(self-care industrial complex)",
      "(AI-speak parodies)",
      "(LinkedIn thought leader parodies)",
      "(humblebrag launch posts with emojis)",
      "(manifestation and law of attraction)",
      "...Unbreakable Habits",
      "Grit, Genius, and Getting to Your Goals (alliteration)",
      "...in a [Place] That...",
      "Why Everything You Know is Wrong About [Topic]",
      "The [Number] [Things]...",
      "From [Bad] to [Good]",
      "(buzzwords and jargon overload)",
      "(buying productivity books instead of working)",
      "(thinking morning routines fix everything)",
      "(following obvious grifters)",
      "(believing in 'life hacks' for complex problems)",
      "(success mythology)"
    ],
    voiceAdjustments: {
      industrySpecificTerms: ['gurus', 'life coaches', 'manifestation', 'productivity hacks', 'morning routines'],
      commonMyths: ['morning routines fix everything', 'thinking positive changes reality', 'hustle culture leads to success'],
      expertTypes: ['productivity gurus', 'life coaches', 'motivational speakers', 'LinkedIn influencers'],
      industryName: 'self-help'
    }
  },
  'parenting': {
    id: 'parenting',
    name: 'parenting',
    displayName: 'Parenting',
    targetAudience: 'exhausted parents dealing with chaos',
    contexts: [
      "The 'Snack Bitch' phenomenon",
      "Gentle parenting vs. reality",
      "Sleep training methods that don't work",
      "Dad's first day alone: 'Is it always like this?'",
      "Morning routine chaos and clothing battles",
      "Screen time guilt and educational apps",
      "Toddler meltdowns in public places",
      "Pinterest-perfect parenting vs. survival mode",
      "The myth of 'enjoying every moment'",
      "Bedtime routine that takes 3 hours",
      "Picky eating and food battles",
      "Parenting influencers selling impossible standards",
      "Mom groups and competitive parenting",
      "The 'wine mom' culture",
      "Developmental milestones anxiety",
      "Helicopter vs. free-range parenting debates",
      "Birthday party planning stress",
      "School pickup line politics",
      "Extracurricular activity overload",
      "The myth of work-life balance with kids",
      "Parenting books that contradict each other",
      "The 'terrible twos' lasting until college",
      "Potty training power struggles",
      "Sibling rivalry management",
      "Technology addiction in kids",
      "Organic everything pressure",
      "Playdates and social scheduling",
      "The cost of raising kids",
      "Parental guilt about everything",
      "Sleep deprivation as a lifestyle",
      "Car seat installation PhD requirements",
      "The myth of family game night",
      "Homework battles and common core math",
      "Teen attitude and eye-rolling mastery",
      "College prep anxiety starting in kindergarten",
      "The 'good parent' performance on social media"
    ],
    voiceAdjustments: {
      industrySpecificTerms: ['gentle parenting', 'attachment parenting', 'sleep consultants', 'mom guilt', 'wine mom'],
      commonMyths: ['perfect parenting exists', 'screen time ruins children', 'you should enjoy every moment', 'good parents never lose their temper'],
      expertTypes: ['parenting influencers', 'sleep consultants', 'child development experts', 'mommy bloggers'],
      industryName: 'parenting'
    }
  },
  'corporate': {
    id: 'corporate',
    name: 'corporate',
    displayName: 'Corporate Life',
    targetAudience: 'office workers trapped in corporate hell',
    contexts: [
      "Open office plans and productivity theater",
      "Synergy and other meaningless buzzwords",
      "Meeting culture and calendar Tetris",
      "Performance reviews and goal-setting BS",
      "Team building exercises nobody wants",
      "Corporate wellness programs",
      "The myth of work-life balance",
      "Micromanagement disguised as mentoring",
      "Email etiquette and reply-all disasters",
      "Dress codes and business casual confusion",
      "Office politics and water cooler gossip",
      "Agile methodology cult worship",
      "KPIs and metrics that measure nothing",
      "Corporate retreats and trust falls",
      "The open door policy that's always closed",
      "Lunch and learn sessions during lunch",
      "Hot-desking and workspace optimization",
      "Company culture and ping pong tables",
      "Performance improvement plans (PIPs)",
      "The myth of unlimited PTO",
      "Slack notifications and always-on culture",
      "Corporate speak translation guide",
      "Networking events and forced socializing",
      "Annual reviews and self-evaluation comedy",
      "Office supply hoarding and printer wars"
    ],
    voiceAdjustments: {
      industrySpecificTerms: ['synergy', 'pivot', 'circle back', 'touch base', 'bandwidth', 'low-hanging fruit'],
      commonMyths: ['corporate ladder still exists', 'hard work always pays off', 'company loyalty matters'],
      expertTypes: ['management consultants', 'HR professionals', 'leadership coaches', 'corporate trainers'],
      industryName: 'corporate life'
    }
  }
};

export function getIndustryById(id: string): IndustryConfig | null {
  return INDUSTRIES[id] || null;
}

export function getAllIndustries(): IndustryConfig[] {
  return Object.values(INDUSTRIES);
}

export function getRandomContext(industryId: string): string {
  const industry = getIndustryById(industryId);
  if (!industry) return INDUSTRIES['self-help'].contexts[0];
  
  const contexts = industry.contexts;
  return contexts[Math.floor(Math.random() * contexts.length)];
}
