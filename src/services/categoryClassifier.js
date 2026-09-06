import Category from "../models/Category.js";

const CATEGORY_DEFINITIONS = [
  {
    name: "Tech",
    description: "Technology, software, startups and developer events",
    keywords: [
      "technology",
      "tech",
      "software",
      "developer",
      "developers",
      "programming",
      "coding",
      "code",
      "web development",
      "app development",
      "cybersecurity",
      "cloud",
      "saas",
      "startup",
      "startups",
      "engineering",
      "engineer",
      "data science",
      "blockchain",
    ],
  },

  {
    name: "AI",
    description: "Artificial intelligence and machine learning events",
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "deep learning",
      "generative ai",
      "genai",
      "chatgpt",
      "llm",
      "large language model",
      "robotics",
      "computer vision",
    ],
  },

  {
    name: "Business",
    description: "Business, entrepreneurship, leadership and networking events",
    keywords: [
      "business",
      "entrepreneur",
      "entrepreneurship",
      "founder",
      "founders",
      "investor",
      "investors",
      "investment",
      "networking",
      "leadership",
      "corporate",
      "finance",
      "sales",
      "marketing",
      "real estate",
      "property",
      "startup",
    ],
  },

  {
    name: "Music",
    description: "Concerts, live music and musical performances",
    keywords: [
      "music",
      "concert",
      "concerts",
      "dj",
      "afrobeats",
      "afrobeat",
      "live band",
      "band",
      "singer",
      "singing",
      "album",
      "musical",
      "performance",
    ],
  },

  {
    name: "Food & Drink",
    description: "Food, dining, cooking and beverage events",
    keywords: [
      "food",
      "drink",
      "drinks",
      "restaurant",
      "dining",
      "dinner",
      "lunch",
      "breakfast",
      "brunch",
      "cooking",
      "chef",
      "culinary",
      "tasting",
      "wine",
      "coffee",
      "cocktail",
    ],
  },

  {
    name: "Running",
    description: "Running, races and road-running events",
    keywords: [
      "running",
      "run",
      "5k",
      "10k",
      "marathon",
      "half marathon",
      "race",
      "road race",
      "jogging",
      "jog",
    ],
  },

  {
    name: "Fitness",
    description: "Exercise, training and physical fitness events",
    keywords: [
      "fitness",
      "gym",
      "workout",
      "exercise",
      "training",
      "crossfit",
      "strength",
      "weightlifting",
      "bodybuilding",
      "cardio",
      "personal trainer",
    ],
  },

  {
    name: "Wellness",
    description: "Wellness, mindfulness and healthy living events",
    keywords: [
      "wellness",
      "mindfulness",
      "meditation",
      "yoga",
      "mental health",
      "self care",
      "self-care",
      "breathwork",
      "holistic",
      "wellbeing",
      "well-being",
      "relaxation",
    ],
  },

  {
    name: "Arts & Culture",
    description: "Art, culture, creativity and exhibitions",
    keywords: [
      "art",
      "arts",
      "culture",
      "creative",
      "creativity",
      "gallery",
      "exhibition",
      "museum",
      "painting",
      "drawing",
      "photography",
      "fashion",
      "theatre",
      "theater",
      "film",
      "cinema",
      "poetry",
      "literature",
    ],
  },

  {
    name: "Climate",
    description: "Climate, sustainability and environmental events",
    keywords: [
      "climate",
      "sustainability",
      "sustainable",
      "environment",
      "environmental",
      "green energy",
      "renewable energy",
      "solar",
      "carbon",
      "recycling",
      "conservation",
      "clean energy",
    ],
  },

  {
    name: "Crypto",
    description: "Cryptocurrency, Web3 and blockchain events",
    keywords: [
      "crypto",
      "cryptocurrency",
      "bitcoin",
      "ethereum",
      "web3",
      "defi",
      "nft",
      "nfts",
      "dao",
      "token",
      "tokens",
      "wallet",
      "blockchain",
    ],
  },

  {
    name: "Education",
    description: "Learning, teaching, workshops and academic events",
    keywords: [
      "education",
      "educational",
      "learning",
      "teaching",
      "teacher",
      "teachers",
      "school",
      "university",
      "college",
      "course",
      "class",
      "workshop",
      "seminar",
      "training",
      "lecture",
      "masterclass",
    ],
  },

  {
    name: "Family",
    description: "Family-friendly and children's events",
    keywords: [
      "family",
      "kids",
      "children",
      "child",
      "parent",
      "parents",
      "parenting",
      "family-friendly",
      "family friendly",
      "playground",
    ],
  },

  {
    name: "Games",
    description: "Games, gaming and recreational competitions",
    keywords: [
      "game",
      "games",
      "gaming",
      "esports",
      "e-sports",
      "board game",
      "board games",
      "video game",
      "playstation",
      "xbox",
      "tournament",
      "chess",
      "poker",
      "quiz",
    ],
  },
];

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function ensureDiscoveryCategories() {
  const categories = [];

  for (const definition of CATEGORY_DEFINITIONS) {
    const category = await Category.findOneAndUpdate(
      { name: definition.name },
      {
        $set: {
          description: definition.description,
          isActive: true,
        },
        $setOnInsert: {
          name: definition.name,
        },
      },
      {
        returnDocument: "after",
        upsert: true,
      },
    );

    categories.push(category);
  }

  return categories;
}

export async function classifyEvent(event) {
  const text = normalizeText(
    [event.title, event.description, event.theme, event.venue, event.city]
      .filter(Boolean)
      .join(" "),
  );

  const categories = await ensureDiscoveryCategories();

  const matches = [];

  for (const definition of CATEGORY_DEFINITIONS) {
    let score = 0;

    for (const keyword of definition.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) continue;

      if (text.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 3 : 2;
      }
    }

    if (score > 0) {
      const category = categories.find((item) => item.name === definition.name);

      if (category) {
        matches.push({
          category,
          score,
        });
      }
    }
  }

  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, 3).map((match) => match.category._id);
}
