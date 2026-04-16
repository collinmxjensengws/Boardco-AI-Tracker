export interface Member {
  name: string;
  email: string;
  org: 'BoardCo' | "Mark's Marine";
  initials: string;
}

export interface Task {
  id: string;
  label: string;
  shortLabel: string;
}

export interface Module {
  id: number;
  week: string;
  title: string;
  due: string;
  description: string;
  color: string;
  tasks: Task[];
}

export const MEMBERS: Member[] = [
  // BoardCo
  { name: 'Adam',      email: 'adamc@boardco.com',       org: 'BoardCo',       initials: 'AC' },
  { name: 'Aaron',     email: 'aaronh@boardco.com',      org: 'BoardCo',       initials: 'AH' },
  { name: 'Alex',      email: 'alex@boardco.com',        org: 'BoardCo',       initials: 'AL' },
  { name: 'Ashley',    email: 'ashley@boardco.com',      org: 'BoardCo',       initials: 'AS' },
  { name: 'Brody',     email: 'brody@boardco.com',       org: 'BoardCo',       initials: 'BP' },
  { name: 'Christoph', email: 'christoph@boardco.com',   org: 'BoardCo',       initials: 'CH' },
  { name: 'Colby',     email: 'colby@boardco.com',       org: 'BoardCo',       initials: 'CB' },
  { name: 'Collin',    email: 'collin@boardco.com',      org: 'BoardCo',       initials: 'CJ' },
  { name: 'Drew',      email: 'drew@boardco.com',        org: 'BoardCo',       initials: 'DG' },
  { name: 'Grady',     email: 'grady@boardco.com',       org: 'BoardCo',       initials: 'GW' },
  { name: 'Hunter',    email: 'hunter@boardco.com',      org: 'BoardCo',       initials: 'HU' },
  { name: 'Jack',      email: 'jackdredge@boardco.com',  org: 'BoardCo',       initials: 'JD' },
  { name: 'Jeff',      email: 'jeff@boardco.com',        org: 'BoardCo',       initials: 'JE' },
  { name: 'Jaiden',    email: 'jaiden@boardco.com',      org: 'BoardCo',       initials: 'JA' },
  { name: 'Jared',     email: 'jared@boardco.com',       org: 'BoardCo',       initials: 'JP' },
  { name: 'Justin',    email: 'justin@boardco.com',      org: 'BoardCo',       initials: 'JF' },
  { name: 'Kara',      email: 'kara@boardco.com',        org: 'BoardCo',       initials: 'KJ' },
  { name: 'Kristin',   email: 'kris@boardco.com',        org: 'BoardCo',       initials: 'KM' },
  { name: 'Kole',      email: 'kole@boardco.com',        org: 'BoardCo',       initials: 'KP' },
  { name: 'McKay',     email: 'mckay@boardco.com',       org: 'BoardCo',       initials: 'MM' },
  { name: 'Miaki',     email: 'miaki@boardco.com',       org: 'BoardCo',       initials: 'MK' },
  { name: 'Mikal',     email: 'mikem@boardco.com',       org: 'BoardCo',       initials: 'MI' },
  { name: 'Mitch',     email: 'mitch@boardco.com',       org: 'BoardCo',       initials: 'MT' },
  { name: 'Nicole',    email: 'nicole@boardco.com',      org: 'BoardCo',       initials: 'NB' },
  { name: 'Parker',    email: 'parker@boardco.com',      org: 'BoardCo',       initials: 'PA' },
  { name: 'Ryan',      email: 'ryan@boardco.com',        org: 'BoardCo',       initials: 'RC' },
  { name: 'Scott',     email: 'scott@boardco.com',       org: 'BoardCo',       initials: 'SC' },
  { name: 'Tanner',    email: 'tanner@boardco.com',      org: 'BoardCo',       initials: 'TB' },
  { name: 'Tom',       email: 'tom@boardco.com',         org: 'BoardCo',       initials: 'TF' },
  { name: 'Troy',      email: 'troy@boardco.com',        org: 'BoardCo',       initials: 'TM' },
  // Mark's Marine
  { name: 'Aaron',     email: 'aaron@marksmarineinc.com',  org: "Mark's Marine", initials: 'AT' },
  { name: 'Heather',   email: 'heather@marksmarineinc.com', org: "Mark's Marine", initials: 'HE' },
  { name: 'Tony',      email: 'tony@marksmarineinc.com',   org: "Mark's Marine", initials: 'TO' },
];

export const MODULES: Module[] = [
  {
    id: 1,
    week: 'Week 1',
    title: 'Claude Setup',
    due: 'April 20',
    description: 'Get set up on Claude as our primary AI tool. Create an account, install the desktop app, read through Level 1 & 2 of the guide, and send your three confirmations to Collin.',
    color: '#0071E3',
    tasks: [
      { id: 'w1_account',      label: 'Created a Claude account',                           shortLabel: 'Account'                                      },
      { id: 'w1_app',          label: 'Downloaded & installed Claude desktop',               shortLabel: 'Desktop App'                                  },
      { id: 'w1_guide',        label: 'Read guide: Level 1 & Level 2',                      shortLabel: 'Read Guide'                                   },
      { id: 'w1_sent_access',  label: 'Gave AI access to email, folders, etc.',             shortLabel: 'Gave AI Access to email, folders, etc.'       },
      { id: 'w1_sent_read',    label: 'Confirmed to Mitch that I read the readings',        shortLabel: 'Confirmed to Mitch that I read the readings'  },
      { id: 'w1_sent_example', label: 'Sent: one thing used Claude to do',                  shortLabel: 'Sent Example'                                 },
    ],
  },
  {
    id: 2,
    week: 'Week 2',
    title: 'Build Something',
    due: 'April 27',
    description: 'Build something useful with what you\'ve learned. Send a .md file, a skill file, or a Claude Project you\'ve built to help you do your actual job better.',
    color: '#34C759',
    tasks: [
      { id: 'w2_submitted', label: 'Submitted .md file, skill file, or Claude Project', shortLabel: 'Submitted' },
    ],
  },
  {
    id: 3,
    week: 'Week 3',
    title: 'Real Output',
    due: 'May 4',
    description: 'Put the tools to work on real output. Create 3 images using freepik.com and complete a data analysis using Claude — use BoardCo data, Cowork, or an app you\'ve built.',
    color: '#FF9500',
    tasks: [
      { id: 'w3_images',   label: 'Created 3 images using Freepik',        shortLabel: 'Freepik Images' },
      { id: 'w3_analysis', label: 'Completed a data analysis using Claude', shortLabel: 'Data Analysis'  },
    ],
  },
  {
    id: 4,
    week: 'Catch-Up',
    title: 'Past Sessions',
    due: 'Ongoing',
    description: 'Watch recordings from the four weekly meetings and the matching Vjal training materials for each week. Do NOT take the quizzes. Access info for Vjal will be sent separately.',
    color: '#AF52DE',
    tasks: [
      { id: 'w4_rec1', label: 'Watched Week 1 meeting recording', shortLabel: 'Week 1 Rec.'    },
      { id: 'w4_rec2', label: 'Watched Week 2 meeting recording', shortLabel: 'Week 2 Rec.'    },
      { id: 'w4_rec3', label: 'Watched Week 3 meeting recording', shortLabel: 'Week 3 Rec.'    },
      { id: 'w4_rec4', label: 'Watched Week 4 meeting recording', shortLabel: 'Week 4 Rec.'    },
      { id: 'w4_vjal', label: 'Watched Vjal training materials',  shortLabel: 'Vjal Materials' },
    ],
  },
];
