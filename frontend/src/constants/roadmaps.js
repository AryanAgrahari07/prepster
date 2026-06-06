// ─── Career Track Roadmaps ────────────────────────────────────────────────────
// Static data — no backend required

export const TRACKS = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    icon: '🖥️',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Master the art of building beautiful, performant web interfaces.',
    duration: '4–6 months',
    roles: ['UI Developer', 'React Developer', 'Frontend Engineer'],
    companies: ['Google', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay'],
    practiceTopics: ['dsa', 'logical'],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: '⚙️',
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    accent: 'text-green-400',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    description: 'Build scalable APIs, microservices, and server-side systems.',
    duration: '4–6 months',
    roles: ['Backend Engineer', 'API Developer', 'Node.js/Java Developer'],
    companies: ['Amazon', 'Zoho', 'Freshworks', 'Infosys', 'TCS'],
    practiceTopics: ['dsa', 'dbms', 'sql', 'os', 'system-design'],
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    icon: '🚀',
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Become a versatile engineer who can build end-to-end products.',
    duration: '6–9 months',
    roles: ['Full Stack Developer', 'MERN Developer', 'Software Engineer'],
    companies: ['Startups', 'Zoho', 'Freshworks', 'Capgemini', 'Accenture'],
    practiceTopics: ['dsa', 'dbms', 'sql', 'system-design'],
  },
  {
    id: 'cloud',
    title: 'Cloud Engineer',
    icon: '☁️',
    color: 'from-sky-500/20 to-blue-500/20',
    border: 'border-sky-500/30',
    accent: 'text-sky-400',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description: 'Design and manage cloud infrastructure on AWS, GCP, or Azure.',
    duration: '4–6 months',
    roles: ['Cloud Engineer', 'DevOps Engineer', 'SRE', 'Solutions Architect'],
    companies: ['AWS', 'Google Cloud', 'Wipro', 'HCL', 'Infosys'],
    practiceTopics: ['os', 'cn', 'system-design'],
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    icon: '🔧',
    color: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/30',
    accent: 'text-orange-400',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    description: 'Bridge development and operations with CI/CD, containers, and automation.',
    duration: '4–5 months',
    roles: ['DevOps Engineer', 'Platform Engineer', 'CI/CD Specialist'],
    companies: ['TCS', 'Infosys', 'HCL', 'Tech Mahindra', 'Wipro'],
    practiceTopics: ['os', 'cn', 'system-design'],
  },
  {
    id: 'android',
    title: 'Android Developer',
    icon: '📱',
    color: 'from-lime-500/20 to-green-500/20',
    border: 'border-lime-500/30',
    accent: 'text-lime-400',
    badge: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
    description: 'Build native Android apps using Kotlin and Jetpack Compose.',
    duration: '4–5 months',
    roles: ['Android Developer', 'Mobile Engineer', 'Kotlin Developer'],
    companies: ['Google', 'Paytm', 'PhonePe', 'Flipkart', 'Ola'],
    practiceTopics: ['dsa', 'oops'],
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    icon: '📊',
    color: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30',
    accent: 'text-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    description: 'Build data pipelines and infrastructure to power analytics and ML.',
    duration: '5–7 months',
    roles: ['Data Engineer', 'ETL Developer', 'Big Data Engineer'],
    companies: ['Amazon', 'Flipkart', 'Razorpay', 'Mu Sigma', 'Fractal'],
    practiceTopics: ['sql', 'dbms', 'dsa', 'system-design'],
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    icon: '🤖',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Build and deploy machine learning models and AI-powered systems.',
    duration: '6–8 months',
    roles: ['ML Engineer', 'AI Developer', 'Research Engineer'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Fractal', 'Mu Sigma'],
    practiceTopics: ['dsa', 'quantitative', 'di'],
  },
];

// ─── Detailed Roadmap Phases per Track ───────────────────────────────────────

export const ROADMAP_DATA = {
  frontend: {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '4–6 weeks',
        color: 'green',
        steps: [
          {
            title: 'HTML & CSS Fundamentals',
            description: 'Build the foundation. Learn semantic HTML5, CSS3, box model, flexbox, and grid.',
            topics: ['HTML5 Semantics', 'CSS3', 'Flexbox', 'CSS Grid', 'Responsive Design', 'Media Queries'],
            resources: [
              { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
              { label: 'freeCodeCamp HTML/CSS', url: 'https://www.freecodecamp.org' },
              { label: 'The Odin Project', url: 'https://www.theodinproject.com' },
            ],
          },
          {
            title: 'JavaScript Essentials',
            description: 'Master JavaScript — the language of the web.',
            topics: ['Variables & Types', 'DOM Manipulation', 'ES6+ Features', 'Async/Await', 'Fetch API', 'Event Loop'],
            resources: [
              { label: 'javascript.info', url: 'https://javascript.info' },
              { label: 'Eloquent JavaScript (free book)', url: 'https://eloquentjavascript.net' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '6–8 weeks',
        color: 'blue',
        steps: [
          {
            title: 'React.js',
            description: 'Learn the most popular frontend framework for building UI components.',
            topics: ['JSX', 'Props & State', 'Hooks (useState, useEffect)', 'Context API', 'React Router', 'Custom Hooks'],
            resources: [
              { label: 'Official React Docs (react.dev)', url: 'https://react.dev' },
              { label: 'Scrimba React Course', url: 'https://scrimba.com/learn/learnreact' },
            ],
          },
          {
            title: 'State Management & API Integration',
            description: 'Manage complex state and integrate backend APIs.',
            topics: ['Redux Toolkit / Zustand', 'TanStack Query', 'REST API calls', 'Axios', 'Error handling'],
            resources: [
              { label: 'Redux Toolkit Docs', url: 'https://redux-toolkit.js.org' },
              { label: 'TanStack Query Docs', url: 'https://tanstack.com/query' },
            ],
          },
          {
            title: 'CSS Frameworks & Design Systems',
            description: 'Build production-quality UIs faster.',
            topics: ['Tailwind CSS', 'CSS Modules', 'Styled Components', 'Shadcn/UI', 'Framer Motion'],
            resources: [
              { label: 'Tailwind CSS Docs', url: 'https://tailwindcss.com' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–6 weeks',
        color: 'purple',
        steps: [
          {
            title: 'Performance & Optimization',
            description: 'Make your apps blazing fast.',
            topics: ['Code Splitting', 'Lazy Loading', 'Web Vitals (LCP, FID, CLS)', 'Memoization', 'Bundle Analysis'],
            resources: [
              { label: 'web.dev Performance', url: 'https://web.dev/performance' },
            ],
          },
          {
            title: 'Testing & Build Tools',
            description: 'Write reliable code with tests and modern tooling.',
            topics: ['Vitest / Jest', 'React Testing Library', 'Vite / Webpack', 'CI/CD basics'],
            resources: [
              { label: 'Testing Library Docs', url: 'https://testing-library.com' },
            ],
          },
          {
            title: 'Portfolio & Job Prep',
            description: 'Land your first frontend role.',
            topics: ['3+ portfolio projects', 'GitHub profile', 'DSA practice (LeetCode Easy/Medium)', 'System Design basics'],
            resources: [],
          },
        ],
      },
    ],
  },

  backend: {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '4–5 weeks',
        color: 'green',
        steps: [
          {
            title: 'Choose a Language',
            description: 'Pick one backend language and get comfortable with it.',
            topics: ['Node.js (JavaScript)', 'Python (Django/FastAPI)', 'Java (Spring Boot)', 'Go'],
            resources: [
              { label: 'Node.js Docs', url: 'https://nodejs.org/en/docs' },
              { label: 'The Odin Project — Node', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs' },
            ],
          },
          {
            title: 'Databases & SQL',
            description: 'Learn relational databases and query language.',
            topics: ['SQL basics', 'PostgreSQL / MySQL', 'Schema Design', 'Joins', 'Indexes', 'Transactions'],
            resources: [
              { label: 'SQLZoo (interactive)', url: 'https://sqlzoo.net' },
              { label: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '5–7 weeks',
        color: 'blue',
        steps: [
          {
            title: 'REST API Design',
            description: 'Build robust, versioned APIs.',
            topics: ['Express.js / FastAPI', 'REST principles', 'Authentication (JWT, OAuth)', 'Rate limiting', 'Middleware'],
            resources: [
              { label: 'Express.js Docs', url: 'https://expressjs.com' },
            ],
          },
          {
            title: 'NoSQL & Caching',
            description: 'Handle large datasets and speed up your app.',
            topics: ['MongoDB / Mongoose', 'Redis', 'Caching strategies', 'Data modelling'],
            resources: [
              { label: 'MongoDB University (free)', url: 'https://university.mongodb.com' },
              { label: 'Redis University', url: 'https://university.redis.com' },
            ],
          },
          {
            title: 'Operating Systems & Networking',
            description: 'Core CS concepts every backend engineer must know.',
            topics: ['Processes & Threads', 'Memory management', 'HTTP/HTTPS', 'TCP/IP', 'DNS', 'Sockets'],
            resources: [
              { label: 'CS50 — Harvard (free)', url: 'https://cs50.harvard.edu' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–6 weeks',
        color: 'purple',
        steps: [
          {
            title: 'System Design',
            description: 'Design scalable distributed systems.',
            topics: ['Load Balancing', 'Horizontal vs Vertical Scaling', 'Message Queues (Kafka, RabbitMQ)', 'CDN', 'Database Sharding', 'CAP Theorem'],
            resources: [
              { label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
              { label: 'ByteByteGo Newsletter', url: 'https://bytebytego.com' },
            ],
          },
          {
            title: 'DSA for Interviews',
            description: 'Crack coding rounds at product companies.',
            topics: ['Arrays', 'LinkedLists', 'Trees & Graphs', 'DP', 'Sliding Window', 'Greedy'],
            resources: [
              { label: 'LeetCode', url: 'https://leetcode.com' },
              { label: 'Striver\'s DSA Sheet', url: 'https://takeuforward.org' },
            ],
          },
        ],
      },
    ],
  },

  fullstack: {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '4–5 weeks',
        color: 'green',
        steps: [
          {
            title: 'Web Fundamentals',
            description: 'HTML, CSS, and vanilla JavaScript are the bedrock.',
            topics: ['HTML5', 'CSS3 + Flexbox/Grid', 'JavaScript ES6+', 'DOM APIs', 'Responsive Design'],
            resources: [{ label: 'The Odin Project (free, full path)', url: 'https://www.theodinproject.com' }],
          },
          {
            title: 'Version Control & Tooling',
            description: 'Work professionally with Git and package managers.',
            topics: ['Git & GitHub', 'npm / pnpm', 'VS Code', 'Terminal basics', 'Linting (ESLint, Prettier)'],
            resources: [{ label: 'Git Handbook (GitHub)', url: 'https://guides.github.com/introduction/git-handbook' }],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '8–10 weeks',
        color: 'blue',
        steps: [
          {
            title: 'React + State Management',
            description: 'Build dynamic UIs with the most popular frontend framework.',
            topics: ['React Hooks', 'React Router', 'Zustand / Redux', 'TanStack Query', 'Forms & Validation'],
            resources: [{ label: 'react.dev', url: 'https://react.dev' }],
          },
          {
            title: 'Node.js + REST API',
            description: 'Power your app with a Node.js backend.',
            topics: ['Express.js', 'JWT Auth', 'MongoDB/Mongoose', 'File uploads', 'Error handling middleware'],
            resources: [{ label: 'Full Stack Open (free, University of Helsinki)', url: 'https://fullstackopen.com' }],
          },
          {
            title: 'Databases',
            description: 'Learn both SQL and NoSQL.',
            topics: ['MongoDB Atlas', 'PostgreSQL', 'SQL basics', 'ORMs (Prisma)', 'Redis caching'],
            resources: [{ label: 'MongoDB University', url: 'https://university.mongodb.com' }],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–5 weeks',
        color: 'purple',
        steps: [
          {
            title: 'DevOps & Deployment',
            description: 'Ship your apps to production.',
            topics: ['Docker', 'CI/CD (GitHub Actions)', 'Vercel/Railway/Render', 'Environment configs', 'Monitoring'],
            resources: [{ label: 'Docker Getting Started', url: 'https://docs.docker.com/get-started' }],
          },
          {
            title: 'System Design & DSA',
            description: 'Interview preparation for product companies.',
            topics: ['System Design basics', 'DSA problem solving', 'OOP design patterns', 'API security'],
            resources: [{ label: 'LeetCode', url: 'https://leetcode.com' }],
          },
        ],
      },
    ],
  },

  cloud: {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '3–4 weeks',
        color: 'green',
        steps: [
          {
            title: 'Linux & Networking Basics',
            description: 'Essential foundation for any cloud/infra role.',
            topics: ['Linux CLI', 'File system', 'Networking (IP, TCP/UDP, DNS, HTTP)', 'SSH', 'Firewalls'],
            resources: [{ label: 'Linux Journey (free)', url: 'https://linuxjourney.com' }],
          },
          {
            title: 'Cloud Provider Fundamentals',
            description: 'Get hands-on with a major cloud platform.',
            topics: ['AWS / GCP / Azure', 'IAM & Security', 'EC2/Compute', 'S3/Storage', 'VPC/Networking'],
            resources: [
              { label: 'AWS Free Tier', url: 'https://aws.amazon.com/free' },
              { label: 'AWS Cloud Practitioner (free on Coursera)', url: 'https://www.coursera.org' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '5–6 weeks',
        color: 'blue',
        steps: [
          {
            title: 'Infrastructure as Code',
            description: 'Automate infrastructure provisioning.',
            topics: ['Terraform', 'AWS CloudFormation', 'Pulumi', 'Configuration management'],
            resources: [{ label: 'HashiCorp Learn — Terraform', url: 'https://learn.hashicorp.com/terraform' }],
          },
          {
            title: 'Containers & Orchestration',
            description: 'Package and scale apps with containers.',
            topics: ['Docker', 'Docker Compose', 'Kubernetes basics', 'Helm charts', 'Container registries'],
            resources: [
              { label: 'Docker Docs', url: 'https://docs.docker.com' },
              { label: 'Kubernetes.io tutorials', url: 'https://kubernetes.io/docs/tutorials' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–5 weeks',
        color: 'purple',
        steps: [
          {
            title: 'CI/CD & Monitoring',
            description: 'Automate delivery pipelines and observe production systems.',
            topics: ['GitHub Actions', 'Jenkins', 'Prometheus + Grafana', 'ELK Stack', 'Alerting'],
            resources: [{ label: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions' }],
          },
          {
            title: 'Cloud Certifications',
            description: 'Industry-recognized credentials that boost your resume.',
            topics: ['AWS Solutions Architect Associate', 'GCP Associate Cloud Engineer', 'CKA (Kubernetes)'],
            resources: [{ label: 'A Cloud Guru', url: 'https://acloudguru.com' }],
          },
        ],
      },
    ],
  },

  devops: {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '3–4 weeks',
        color: 'green',
        steps: [
          {
            title: 'Linux & Shell Scripting',
            description: 'The core of DevOps work happens in the terminal.',
            topics: ['Bash scripting', 'Process management', 'cron jobs', 'File permissions', 'systemd'],
            resources: [{ label: 'Linux Command Line (free book)', url: 'https://linuxcommand.org/tlcl.php' }],
          },
          {
            title: 'Version Control & Collaboration',
            description: 'Git workflows used in real engineering teams.',
            topics: ['Git Flow', 'Pull Requests', 'Code reviews', 'Branching strategies', 'Merge vs Rebase'],
            resources: [{ label: 'Atlassian Git Tutorials', url: 'https://www.atlassian.com/git/tutorials' }],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '6–7 weeks',
        color: 'blue',
        steps: [
          {
            title: 'Docker & Containers',
            description: 'Package applications for consistent deployments.',
            topics: ['Dockerfile', 'Docker Compose', 'Networking', 'Volumes', 'Multi-stage builds'],
            resources: [{ label: 'Play with Docker (free lab)', url: 'https://labs.play-with-docker.com' }],
          },
          {
            title: 'CI/CD Pipelines',
            description: 'Automate build, test, and deploy workflows.',
            topics: ['GitHub Actions', 'Jenkins', 'GitLab CI', 'ArgoCD', 'Pipeline as Code'],
            resources: [{ label: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions' }],
          },
          {
            title: 'Kubernetes',
            description: 'Orchestrate containers at scale.',
            topics: ['Pods, Deployments, Services', 'ConfigMaps & Secrets', 'Ingress', 'HPA', 'Helm'],
            resources: [{ label: 'KillerCoda (free K8s labs)', url: 'https://killercoda.com' }],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–5 weeks',
        color: 'purple',
        steps: [
          {
            title: 'Monitoring & Observability',
            description: 'Detect and fix issues before users do.',
            topics: ['Prometheus', 'Grafana', 'ELK Stack', 'Jaeger (Tracing)', 'SLOs & SLAs'],
            resources: [{ label: 'Grafana Labs Tutorials', url: 'https://grafana.com/tutorials' }],
          },
          {
            title: 'Security (DevSecOps)',
            description: 'Shift security left into the development pipeline.',
            topics: ['SAST/DAST scanning', 'Secrets management (Vault)', 'Container security', 'RBAC'],
            resources: [],
          },
        ],
      },
    ],
  },

  android: {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '4–5 weeks',
        color: 'green',
        steps: [
          {
            title: 'Kotlin Fundamentals',
            description: 'Learn Kotlin — the primary language for Android development.',
            topics: ['Variables, Types', 'Functions & Lambdas', 'OOP in Kotlin', 'Coroutines', 'Null Safety'],
            resources: [
              { label: 'Kotlin Playground', url: 'https://play.kotlinlang.org' },
              { label: 'Android Basics with Compose (free, Google)', url: 'https://developer.android.com/courses/android-basics-compose/course' },
            ],
          },
          {
            title: 'Android Fundamentals',
            description: 'Understand how Android apps are structured.',
            topics: ['Activities & Fragments', 'Intents', 'Layouts (XML)', 'RecyclerView', 'ViewModel'],
            resources: [{ label: 'developer.android.com/guide', url: 'https://developer.android.com/guide' }],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '6–7 weeks',
        color: 'blue',
        steps: [
          {
            title: 'Jetpack Compose',
            description: 'Build modern Android UIs with declarative UI.',
            topics: ['Composables', 'State & Recomposition', 'Navigation', 'Theming', 'Animations'],
            resources: [{ label: 'Compose Pathway (free, Google)', url: 'https://developer.android.com/courses/pathways/compose' }],
          },
          {
            title: 'Networking & Data',
            description: 'Fetch, persist, and cache data.',
            topics: ['Retrofit + OkHttp', 'Room Database', 'DataStore', 'JSON Parsing (Gson/Moshi)'],
            resources: [],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–5 weeks',
        color: 'purple',
        steps: [
          {
            title: 'Architecture Patterns',
            description: 'Build maintainable, testable Android apps.',
            topics: ['MVVM', 'Clean Architecture', 'Dependency Injection (Hilt)', 'Unit Testing'],
            resources: [{ label: 'Android Architecture Guide', url: 'https://developer.android.com/topic/architecture' }],
          },
          {
            title: 'Publish & Interview Prep',
            description: 'Ship your app and prepare for interviews.',
            topics: ['Google Play Store', 'App signing', 'ProGuard/R8', 'DSA + OOP prep'],
            resources: [{ label: 'LeetCode', url: 'https://leetcode.com' }],
          },
        ],
      },
    ],
  },

  'data-engineer': {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '4–5 weeks',
        color: 'green',
        steps: [
          {
            title: 'SQL & Databases',
            description: 'The most critical skill for any data role.',
            topics: ['SQL (SELECT, JOIN, GROUP BY)', 'Window Functions', 'CTEs', 'Indexes', 'Query Optimization'],
            resources: [
              { label: 'Mode SQL Tutorial (free)', url: 'https://mode.com/sql-tutorial' },
              { label: 'SQLZoo', url: 'https://sqlzoo.net' },
            ],
          },
          {
            title: 'Python for Data',
            description: 'Python is the backbone of data engineering.',
            topics: ['Python basics', 'Pandas', 'NumPy', 'File I/O (CSV, JSON, Parquet)', 'APIs'],
            resources: [{ label: 'Kaggle Python Course (free)', url: 'https://www.kaggle.com/learn/python' }],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '6–8 weeks',
        color: 'blue',
        steps: [
          {
            title: 'Data Pipeline & ETL',
            description: 'Move and transform data at scale.',
            topics: ['Apache Airflow', 'dbt (data build tool)', 'ETL vs ELT', 'Data Warehousing concepts', 'Batch vs Streaming'],
            resources: [{ label: 'Apache Airflow Docs', url: 'https://airflow.apache.org/docs' }],
          },
          {
            title: 'Big Data Tools',
            description: 'Process massive datasets efficiently.',
            topics: ['Apache Spark', 'Hadoop basics', 'Kafka (streaming)', 'Databricks', 'Delta Lake'],
            resources: [{ label: 'Databricks Free Training', url: 'https://customer-academy.databricks.com' }],
          },
          {
            title: 'Cloud Data Services',
            description: 'Modern data engineering happens in the cloud.',
            topics: ['AWS (Redshift, Glue, S3)', 'GCP (BigQuery, Dataflow)', 'Snowflake'],
            resources: [],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '3–4 weeks',
        color: 'purple',
        steps: [
          {
            title: 'Data Modeling & Governance',
            description: 'Design robust data architectures.',
            topics: ['Star Schema / Snowflake Schema', 'Data Lakehouse', 'Data Catalog', 'Data Quality', 'Lineage'],
            resources: [],
          },
          {
            title: 'Interview Prep',
            description: 'Prepare for data engineering interviews.',
            topics: ['SQL hard problems', 'System design for data', 'DSA basics'],
            resources: [{ label: 'Data Engineering Interview Questions (GitHub)', url: 'https://github.com' }],
          },
        ],
      },
    ],
  },

  'ml-engineer': {
    phases: [
      {
        phase: 'Phase 1',
        level: 'Beginner',
        duration: '4–6 weeks',
        color: 'green',
        steps: [
          {
            title: 'Mathematics & Statistics',
            description: 'The foundation of ML.',
            topics: ['Linear Algebra', 'Calculus (Gradients)', 'Probability & Statistics', 'Bayes Theorem', 'Distributions'],
            resources: [
              { label: '3Blue1Brown (YouTube — Math visuals)', url: 'https://www.3blue1brown.com' },
              { label: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' },
            ],
          },
          {
            title: 'Python & Data Libraries',
            description: 'Essential tools for ML practitioners.',
            topics: ['Python', 'NumPy', 'Pandas', 'Matplotlib/Seaborn', 'Scikit-learn'],
            resources: [{ label: 'Fast.ai Practical Deep Learning (free)', url: 'https://course.fast.ai' }],
          },
        ],
      },
      {
        phase: 'Phase 2',
        level: 'Intermediate',
        duration: '8–10 weeks',
        color: 'blue',
        steps: [
          {
            title: 'Core ML Algorithms',
            description: 'Learn the building blocks of machine learning.',
            topics: ['Linear/Logistic Regression', 'Decision Trees', 'Random Forests', 'SVM', 'KMeans Clustering', 'Evaluation Metrics'],
            resources: [{ label: 'Hands-On ML with Scikit-Learn (book)', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632' }],
          },
          {
            title: 'Deep Learning',
            description: 'Neural networks powering modern AI.',
            topics: ['Neural Networks (ANN, CNN, RNN)', 'PyTorch / TensorFlow', 'Transfer Learning', 'Transformers', 'LLMs basics'],
            resources: [
              { label: 'Deep Learning Specialization — Coursera (Andrew Ng)', url: 'https://www.coursera.org/specializations/deep-learning' },
              { label: 'fast.ai', url: 'https://course.fast.ai' },
            ],
          },
        ],
      },
      {
        phase: 'Phase 3',
        level: 'Advanced',
        duration: '4–6 weeks',
        color: 'purple',
        steps: [
          {
            title: 'MLOps & Model Deployment',
            description: 'Take models from notebook to production.',
            topics: ['Docker for ML', 'FastAPI model serving', 'MLflow', 'Feature Stores', 'Model Monitoring'],
            resources: [{ label: 'MLOps Zoomcamp (free)', url: 'https://github.com/DataTalksClub/mlops-zoomcamp' }],
          },
          {
            title: 'Interview Prep',
            description: 'Crack ML engineering and data science interviews.',
            topics: ['ML theory questions', 'Statistics puzzles', 'Coding (DSA basics)', 'ML system design'],
            resources: [],
          },
        ],
      },
    ],
  },
};
