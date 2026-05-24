export interface DemoEssay {
  id: string
  title: string
  excerpt: string
  author: string
  username: string
  bookTitle: string
  bookAuthor: string
  readTime: string
  gradient: string
  body?: string
}

export interface DemoProfile {
  username: string
  displayName: string
  bio: string
  cover_url?: string
  website?: string
  twitter_handle?: string
}

export const demoProfiles: DemoProfile[] = [
  {
    username: 'elara_writes',
    displayName: 'Elara Chen',
    bio: 'Literature student at UC Berkeley. I read to understand the world, and I write to make sense of what I read.',
    website: 'elaracheng.com',
    twitter_handle: '@elara_writes',
  },
  {
    username: 'marcus_reader',
    displayName: 'Marcus Thompson',
    bio: 'High school senior. Building my reading portfolio for college applications. Current goal: 24 books this year.',
  },
  {
    username: 'sophia_pages',
    displayName: 'Sophia Patel',
    bio: 'English major, aspiring editor. Every book is a conversation I want to be part of.',
    website: 'sophiapages.substack.com',
    twitter_handle: '@sophia_pages',
  },
]

export const demoEssays: DemoEssay[] = [
  {
    id: 'demo-1',
    title: 'The Silence That Speaks: On Isolation in Station Eleven',
    excerpt:
      'Emily St. John Mandel builds a world where civilization has collapsed, but what haunts me most is not the pandemic—it is the quiet dignity of people trying to preserve art in a world that no longer needs it.',
    author: 'Elara Chen',
    username: 'elara_writes',
    bookTitle: 'Station Eleven',
    bookAuthor: 'Emily St. John Mandel',
    readTime: '8 min read',
    gradient: 'from-blue-800/80 to-blue-900/90',
    body: 'Emily St. John Mandel builds a world where civilization has collapsed, but what haunts me most is not the pandemic—it is the quiet dignity of people trying to preserve art in a world that no longer needs it.\n\nThere is a moment in the novel when Kirsten, now a grown woman performing Shakespeare in the settlements of the Great Lakes region, encounters a relic of the old world: a tablet containing episodes of a television show called Station Eleven. She does not have the password. She cannot watch the episodes. But she carries the tablet anyway, as if it were a sacred object.\n\nThis is what stayed with me after I finished the book. Not the plague, not the collapse, but the way people cling to beauty even when survival is uncertain. Mandel is not writing about survival. She is writing about what makes survival worth the effort.\n\nThe compendium of survival is a recurring motif in the book. It begins as a practical guide, but by the end it has become something else entirely—a record of what was lost, a testament to what mattered. I think about this when I consider why I read. We are not reading to survive. We are reading to remember what it means to be alive.',
  },
  {
    id: 'demo-2',
    title: 'The Weight of Inheritance in The Dutch House',
    excerpt:
      'Patchett has written a ghost story where the ghost is a building. The Dutch House is not about a house at all—it is about the stories we tell ourselves to make peace with the past.',
    author: 'Marcus Thompson',
    username: 'marcus_reader',
    bookTitle: 'The Dutch House',
    bookAuthor: 'Ann Patchett',
    readTime: '6 min read',
    gradient: 'from-green-800/80 to-green-900/90',
    body: 'Ann Patchett has written a ghost story where the ghost is a building. The Dutch House is not about a house at all—it is about the stories we tell ourselves to make peace with the past.\n\nDanny and Maeve spend decades returning to the house that was taken from them. They drive past it, circle it, obsess over it. But the house itself is indifferent. It does not care about their grief. It simply exists, as houses do, while people project their wounds onto its walls.\n\nWhat makes the novel remarkable is Patchett\'s refusal to give us a dramatic confrontation. The resolution, when it comes, is quiet and almost ordinary. That is the point. Healing does not arrive as a revelation. It creeps up on you, disguised as an ordinary Tuesday.',
  },
  {
    id: 'demo-3',
    title: 'On Not Finishing: What I Learned From Giving Up On Ulysses',
    excerpt:
      'I tried to read Joyce\'s masterpiece three times. The third time, I gave myself permission to stop. Here is why that might be the most important reading lesson I have ever learned.',
    author: 'Sophia Patel',
    username: 'sophia_pages',
    bookTitle: 'Ulysses',
    bookAuthor: 'James Joyce',
    readTime: '5 min read',
    gradient: 'from-red-800/80 to-red-900/90',
    body: 'I have started James Joyce\'s Ulysses three times. The first time, I was seventeen and wanted to prove I could. The second time, I was nineteen and wanted to understand what all the fuss was about. The third time, I was twenty-one and wanted to finally conquer it.\n\nI stopped at page 198. And I did not feel like a failure. I felt relieved.\n\nHere is what I have learned: reading is not a competition. There is no finish line. There is no scoreboard. The books we put down are just as important as the books we finish. They teach us about our limits, our tastes, our attention spans. They teach us that not every book is written for every reader.\n\nI may come back to Ulysses someday. Or I may not. Either way, I am okay with that.',
  },
]
