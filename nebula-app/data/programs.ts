// Sample categories
const programCategories = [
  {
    id: "cat_001",
    name: "Web Development",
    slug: "web-development",
    isActive: true,
  },
  { id: "cat_002", name: "Data Science", slug: "data-science", isActive: true },
  {
    id: "cat_003",
    name: "Mobile Development",
    slug: "mobile-development",
    isActive: true,
  },
  { id: "cat_004", name: "DevOps", slug: "devops", isActive: true },
  {
    id: "cat_005",
    name: "Product Management",
    slug: "product-management",
    isActive: true,
  },
  { id: "cat_006", name: "UX/UI Design", slug: "ux-ui-design", isActive: true },
  {
    id: "cat_007",
    name: "Career Growth",
    slug: "career-growth",
    isActive: true,
  },
  { id: "cat_008", name: "Business", slug: "business", isActive: true },
];

const programCoaches = [
  {
    id: "coach_001",
    title: "Senior Frontend Developer & Mentor",
    user: {
      fullName: "Sarah Johnson",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
  {
    id: "coach_002",
    title: "Executive Leadership Coach",
    user: {
      fullName: "Michael Rodriguez",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
  {
    id: "coach_003",
    title: "Career Transition Specialist",
    user: {
      fullName: "Lisa Chen",
      avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    },
  },
  {
    id: "coach_004",
    title: "Product Management Coach",
    user: {
      fullName: "David Park",
      avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
    },
  },
  {
    id: "coach_005",
    title: "Backend Systems Architect",
    user: {
      fullName: "Alex Thompson",
      avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    },
  },
];

export const transformedPrograms = [
  {
    id: "prog_001",
    title: "React Masterclass: From Zero to Hero",
    categoryId: "cat_001",
    description:
      "Master React with hooks, context, and modern patterns. Build real-world applications with best practices.",
    objectives: [
      "Master React fundamentals and advanced patterns",
      "Build scalable React applications",
      "Learn state management with Context and Redux",
      "Implement testing and deployment strategies",
    ],
    coachId: "coach_001",
    slug: "react-masterclass-zero-to-hero",
    rating: 4.9,
    totalReviews: 247,
    price: 299,
    duration: "8 weeks",
    difficultyLevel: "INTERMEDIATE",
    maxStudents: 50,
    currentEnrollments: 42,
    isActive: true,
    status: "ACTIVE",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    prerequisites: ["Basic HTML/CSS", "JavaScript fundamentals"],
    attendees: [
      "https://randomuser.me/api/portraits/women/1.jpg",
      "https://randomuser.me/api/portraits/men/1.jpg",
      "https://randomuser.me/api/portraits/women/2.jpg",
      "https://randomuser.me/api/portraits/men/2.jpg",
    ],
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-11-10T14:30:00.000Z",
    category: programCategories[0], // Web Development
    coach: programCoaches[0], // Sarah Johnson
    enrollments: [
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/1.jpg",
          },
        },
      },
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg" },
        },
      },
    ],
    modules: [
      {
        id: "mod_001",
        title: "React Fundamentals",
        description: "Learn JSX, components, props, and state",
        week: 1,
        duration: "4 hours",
        order: 1,
      },
      {
        id: "mod_002",
        title: "Hooks and Effects",
        description: "Master useState, useEffect, and custom hooks",
        week: 2,
        duration: "6 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 42,
      reviews: 247,
    },
  },
  {
    id: "prog_002",
    title: "Data Science Bootcamp with Python",
    categoryId: "cat_002",
    description:
      "Complete data science course covering Python, pandas, scikit-learn, and machine learning fundamentals.",
    objectives: [
      "Master Python for data analysis",
      "Learn data visualization with matplotlib and seaborn",
      "Build machine learning models",
      "Work on real-world data projects",
    ],
    coachId: "coach_005",
    slug: "data-science-bootcamp-python",
    rating: 4.8,
    totalReviews: 189,
    price: 399,
    duration: "12 weeks",
    difficultyLevel: "BEGINNER",
    maxStudents: 40,
    currentEnrollments: 38,
    isActive: true,
    status: "ACTIVE",
    tags: ["Python", "Data Science", "Machine Learning", "AI"],
    prerequisites: ["Basic programming knowledge"],
    attendees: [
      "https://randomuser.me/api/portraits/men/3.jpg",
      "https://randomuser.me/api/portraits/women/3.jpg",
    ],
    createdAt: "2024-02-20T09:00:00.000Z",
    updatedAt: "2024-11-05T11:20:00.000Z",
    category: programCategories[1], // Data Science
    coach: programCoaches[4], // Alex Thompson
    enrollments: [
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/3.jpg" },
        },
      },
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/3.jpg",
          },
        },
      },
    ],
    modules: [
      {
        id: "mod_003",
        title: "Python Basics for Data Science",
        description: "Python fundamentals, NumPy, and pandas",
        week: 1,
        duration: "5 hours",
        order: 1,
      },
      {
        id: "mod_004",
        title: "Data Visualization",
        description: "Creating charts and plots with matplotlib",
        week: 2,
        duration: "4 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 38,
      reviews: 189,
    },
  },
  {
    id: "prog_003",
    title: "iOS Development with SwiftUI",
    categoryId: "cat_003",
    description:
      "Build beautiful iOS apps using SwiftUI. From basics to App Store submission.",
    objectives: [
      "Master Swift programming language",
      "Build responsive UIs with SwiftUI",
      "Integrate with APIs and databases",
      "Publish apps to the App Store",
    ],
    coachId: "coach_001",
    slug: "ios-development-swiftui",
    rating: 4.7,
    totalReviews: 156,
    price: 349,
    duration: "10 weeks",
    difficultyLevel: "INTERMEDIATE",
    maxStudents: 35,
    currentEnrollments: 32,
    isActive: true,
    status: "ACTIVE",
    tags: ["iOS", "Swift", "SwiftUI", "Mobile Development"],
    prerequisites: ["Basic programming concepts"],
    attendees: [
      "https://randomuser.me/api/portraits/women/4.jpg",
      "https://randomuser.me/api/portraits/men/4.jpg",
      "https://randomuser.me/api/portraits/women/5.jpg",
    ],
    createdAt: "2024-03-10T14:00:00.000Z",
    updatedAt: "2024-11-12T16:45:00.000Z",
    category: programCategories[2], // Mobile Development
    coach: programCoaches[0], // Sarah Johnson
    enrollments: [
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/4.jpg",
          },
        },
      },
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/4.jpg" },
        },
      },
    ],
    modules: [
      {
        id: "mod_005",
        title: "Swift Fundamentals",
        description: "Learn Swift syntax and features",
        week: 1,
        duration: "6 hours",
        order: 1,
      },
      {
        id: "mod_006",
        title: "SwiftUI Basics",
        description: "Building views with SwiftUI",
        week: 2,
        duration: "5 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 32,
      reviews: 156,
    },
  },
  {
    id: "prog_004",
    title: "DevOps Engineering Fundamentals",
    categoryId: "cat_004",
    description:
      "Learn CI/CD, Docker, Kubernetes, and cloud infrastructure management.",
    objectives: [
      "Master Docker containerization",
      "Build CI/CD pipelines",
      "Deploy applications with Kubernetes",
      "Implement monitoring and logging",
    ],
    coachId: "coach_005",
    slug: "devops-engineering-fundamentals",
    rating: 4.9,
    totalReviews: 134,
    price: 449,
    duration: "14 weeks",
    difficultyLevel: "ADVANCED",
    maxStudents: 30,
    currentEnrollments: 28,
    isActive: true,
    status: "ACTIVE",
    tags: ["DevOps", "Docker", "Kubernetes", "AWS", "CI/CD"],
    prerequisites: ["Linux basics", "Networking fundamentals"],
    attendees: [
      "https://randomuser.me/api/portraits/men/6.jpg",
      "https://randomuser.me/api/portraits/women/6.jpg",
      "https://randomuser.me/api/portraits/men/7.jpg",
    ],
    createdAt: "2024-04-05T11:00:00.000Z",
    updatedAt: "2024-11-08T09:15:00.000Z",
    category: programCategories[3], // DevOps
    coach: programCoaches[4], // Alex Thompson
    enrollments: [
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/6.jpg" },
        },
      },
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/6.jpg",
          },
        },
      },
    ],
    modules: [
      {
        id: "mod_007",
        title: "Docker Containers",
        description: "Containerization with Docker",
        week: 1,
        duration: "5 hours",
        order: 1,
      },
      {
        id: "mod_008",
        title: "Kubernetes Orchestration",
        description: "Managing containers with Kubernetes",
        week: 2,
        duration: "6 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 28,
      reviews: 134,
    },
  },
  {
    id: "prog_005",
    title: "Product Management Certification",
    categoryId: "cat_005",
    description:
      "Become a product manager. Learn strategy, roadmapping, user research, and agile methodologies.",
    objectives: [
      "Master product strategy development",
      "Learn user research techniques",
      "Create product roadmaps",
      "Lead agile development teams",
    ],
    coachId: "coach_004",
    slug: "product-management-certification",
    rating: 4.8,
    totalReviews: 178,
    price: 499,
    duration: "16 weeks",
    difficultyLevel: "BEGINNER",
    maxStudents: 45,
    currentEnrollments: 43,
    isActive: true,
    status: "ACTIVE",
    tags: ["Product Management", "Strategy", "Agile", "User Research"],
    prerequisites: ["Business understanding", "Communication skills"],
    attendees: [
      "https://randomuser.me/api/portraits/women/8.jpg",
      "https://randomuser.me/api/portraits/men/8.jpg",
      "https://randomuser.me/api/portraits/women/9.jpg",
      "https://randomuser.me/api/portraits/men/9.jpg",
    ],
    createdAt: "2024-05-15T08:30:00.000Z",
    updatedAt: "2024-11-14T13:40:00.000Z",
    category: programCategories[4], // Product Management
    coach: programCoaches[3], // David Park
    enrollments: [
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/8.jpg",
          },
        },
      },
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/8.jpg" },
        },
      },
    ],
    modules: [
      {
        id: "mod_009",
        title: "Product Strategy",
        description: "Developing product vision and strategy",
        week: 1,
        duration: "4 hours",
        order: 1,
      },
      {
        id: "mod_010",
        title: "User Research Methods",
        description: "Conducting effective user research",
        week: 2,
        duration: "5 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 43,
      reviews: 178,
    },
  },
  {
    id: "prog_006",
    title: "UX/UI Design Mastery",
    categoryId: "cat_006",
    description:
      "Complete design course covering user research, wireframing, prototyping, and design systems.",
    objectives: [
      "Master design thinking process",
      "Create wireframes and prototypes",
      "Build design systems",
      "Conduct usability testing",
    ],
    coachId: "coach_001",
    slug: "ux-ui-design-mastery",
    rating: 4.7,
    totalReviews: 145,
    price: 379,
    duration: "10 weeks",
    difficultyLevel: "BEGINNER",
    maxStudents: 40,
    currentEnrollments: 36,
    isActive: true,
    status: "ACTIVE",
    tags: ["UX Design", "UI Design", "Figma", "User Research"],
    prerequisites: ["Basic design sense", "Creativity"],
    attendees: [
      "https://randomuser.me/api/portraits/women/10.jpg",
      "https://randomuser.me/api/portraits/men/10.jpg",
    ],
    createdAt: "2024-06-20T13:00:00.000Z",
    updatedAt: "2024-11-09T10:50:00.000Z",
    category: programCategories[5], // UX/UI Design
    coach: programCoaches[0], // Sarah Johnson
    enrollments: [
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/10.jpg",
          },
        },
      },
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/10.jpg" },
        },
      },
    ],
    modules: [
      {
        id: "mod_011",
        title: "Design Thinking",
        description: "Introduction to design thinking methodology",
        week: 1,
        duration: "4 hours",
        order: 1,
      },
      {
        id: "mod_012",
        title: "Figma Fundamentals",
        description: "Mastering Figma for design work",
        week: 2,
        duration: "6 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 36,
      reviews: 145,
    },
  },
  {
    id: "prog_007",
    title: "Career Accelerator Program",
    categoryId: "cat_007",
    description:
      "Advance your tech career with personalized coaching, interview prep, and career strategy.",
    objectives: [
      "Develop career advancement strategy",
      "Master technical interviews",
      "Build professional network",
      "Negotiate salary and promotions",
    ],
    coachId: "coach_003",
    slug: "career-accelerator-program",
    rating: 4.9,
    totalReviews: 223,
    price: 299,
    duration: "8 weeks",
    difficultyLevel: "BEGINNER",
    maxStudents: 60,
    currentEnrollments: 58,
    isActive: true,
    status: "ACTIVE",
    tags: [
      "Career Growth",
      "Interview Prep",
      "Networking",
      "Salary Negotiation",
    ],
    prerequisites: ["Professional experience", "Career goals"],
    attendees: [
      "https://randomuser.me/api/portraits/women/11.jpg",
      "https://randomuser.me/api/portraits/men/11.jpg",
      "https://randomuser.me/api/portraits/women/12.jpg",
      "https://randomuser.me/api/portraits/men/12.jpg",
    ],
    createdAt: "2024-07-10T15:00:00.000Z",
    updatedAt: "2024-11-11T12:25:00.000Z",
    category: programCategories[6], // Career Growth
    coach: programCoaches[2], // Lisa Chen
    enrollments: [
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/11.jpg",
          },
        },
      },
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/11.jpg" },
        },
      },
    ],
    modules: [
      {
        id: "mod_013",
        title: "Career Assessment",
        description: "Evaluate your current career status",
        week: 1,
        duration: "3 hours",
        order: 1,
      },
      {
        id: "mod_014",
        title: "Technical Interview Prep",
        description: "Master coding interviews",
        week: 2,
        duration: "5 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 58,
      reviews: 223,
    },
  },
  {
    id: "prog_008",
    title: "Tech Startup Fundamentals",
    categoryId: "cat_008",
    description:
      "Learn how to build and scale tech startups from idea to market.",
    objectives: [
      "Validate business ideas",
      "Build MVP products",
      "Raise startup funding",
      "Scale startup operations",
    ],
    coachId: "coach_004",
    slug: "tech-startup-fundamentals",
    rating: 4.6,
    totalReviews: 89,
    price: 429,
    duration: "12 weeks",
    difficultyLevel: "INTERMEDIATE",
    maxStudents: 35,
    currentEnrollments: 31,
    isActive: true,
    status: "ACTIVE",
    tags: ["Startup", "Entrepreneurship", "Funding", "Business Strategy"],
    prerequisites: ["Business interest", "Problem-solving mindset"],
    attendees: [
      "https://randomuser.me/api/portraits/men/13.jpg",
      "https://randomuser.me/api/portraits/women/13.jpg",
    ],
    createdAt: "2024-08-05T09:30:00.000Z",
    updatedAt: "2024-11-13T15:10:00.000Z",
    category: programCategories[7], // Business
    coach: programCoaches[3], // David Park
    enrollments: [
      {
        student: {
          user: { avatarUrl: "https://randomuser.me/api/portraits/men/13.jpg" },
        },
      },
      {
        student: {
          user: {
            avatarUrl: "https://randomuser.me/api/portraits/women/13.jpg",
          },
        },
      },
    ],
    modules: [
      {
        id: "mod_015",
        title: "Idea Validation",
        description: "Testing and validating business ideas",
        week: 1,
        duration: "4 hours",
        order: 1,
      },
      {
        id: "mod_016",
        title: "MVP Development",
        description: "Building minimum viable products",
        week: 2,
        duration: "5 hours",
        order: 2,
      },
    ],
    _count: {
      enrollments: 31,
      reviews: 89,
    },
  },
];

// Grouped programs (as returned by your API)
export const groupedPrograms = [
  {
    group: "Web Development",
    items: [
      transformedPrograms[0],
      transformedPrograms[0],
      transformedPrograms[0],
      transformedPrograms[0],
    ], // React Masterclass
  },
  {
    group: "Data Science",
    items: [
      transformedPrograms[1],
      transformedPrograms[1],
      transformedPrograms[1],
      transformedPrograms[1],
    ], // Data Science Bootcamp
  },
  {
    group: "Mobile Development",
    items: [
      transformedPrograms[2],
      transformedPrograms[2],
      transformedPrograms[2],
      transformedPrograms[2],
    ], // iOS Development
  },
];

// Complete API response structure
export const programsApiResponse = {
  success: true,
  data: {
    programs: transformedPrograms,
    groupedPrograms: groupedPrograms,
  },
  message: "Programs retrieved successfully",
};
