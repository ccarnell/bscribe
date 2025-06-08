# 📚 BScribe.ai

> I can't believe I actually built this BS.

BScribe.ai is a satirical self-help ebook marketplace that uses AI to generate parodies.. Finally, honest advice that admits it doesn't know what it's talking about.

## 🎯 What This Actually Is

A Next.js e-commerce platform that:
- Generates satirical self-help books using Claude AI
- Sells them as PDFs through Stripe integration
- Provides both free samples and premium content
- Features an admin interface for content generation
- Maintains the perfect balance of chaos and charm

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Anthropic Claude API
- **Payments**: Stripe
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## 📋 Features

### 🛒 E-commerce
- Individual book purchases (Built. Not deployed yet.)
- Bundle pricing (Built. Not deployed yet.)
- Stripe payment processing (Built. Not deployed yet.)
- Automated PDF delivery (Available for free PDF)
- Download tracking and analytics (I actually don't know how true this is. Claude wrote this READ.me)

### 🤖 AI Content Generation
- Multi-agent book generation system (Okay, this I DO know is true. We built a satire engine that has turned into a publishing monster)
- Title/Subtitle generation with context awareness (maybe even real awareness)
- Chapter structure creation (Regeneration/Restructure too)
- Content generation with quality review (SUPER proprietary information)
- Revision system for improving output (Ahem, recommendations are optional, thank you)
- Pattern tracking to avoid repetition (SUPER proprietary information)

### 👤 User Management
- Supabase authentication (email/password, OAuth)
- User accounts and purchase history (Built. Not deployed)
- Admin role management
- Customer portal integration (Built. Not deployed)

### 📖 Book Management
- Free tier (sample books)
- Premium tier (Built. Not deplooyed)
- Bundle offerings (Bult. Not deployed)
- Storage organization (free/, individual/, bundles/)

## 🛠 Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Anthropic API key

### 1. Clone and Install
```bash
git clone [your-repo-url]
cd bscribe
npm install
```

### 2. Environment Variables
Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup
```bash
# Start Supabase locally (optional)
npx supabase start

# Or use hosted Supabase and run migrations
npx supabase db push
```

### 4. Stripe Setup
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Set up webhook forwarding (new terminal)
stripe listen --forward-to localhost:3000/api/webhooks

# Load test products (optional)
stripe fixtures fixtures/stripe-fixtures.json
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── create-checkout/    # Stripe checkout
│   │   ├── download/           # Paid book downloads
│   │   ├── download-free/      # Free book downloads
│   │   ├── file-proxy/         # File serving proxy
│   │   ├── generate/           # AI generation endpoints
│   │   └── webhooks/           # Stripe webhooks
│   ├── admin/                  # Admin interface
│   │   └── generate/           # Book generation UI
│   ├── auth/                   # Auth callbacks
│   ├── account/                # User account pages
│   └── success/                # Post-purchase pages
├── components/
│   └── ui/                     # Reusable components
├── utils/
│   ├── supabase/               # Database utilities
│   ├── stripe/                 # Payment utilities
│   └── auth-helpers/           # Authentication
├── supabase/
│   ├── migrations/             # Database migrations
│   └── config.toml             # Supabase config
└── types_db.ts                # Database types
```

## 🎭 Content Generation System

### AI Agents
1. **Title Agent**: Generates satirical book titles using a delicate structure of prompt engineering
2. **Chapter Agent**: Creates dumb titles that I usually have to regenerate
3. **Content Agent**: Writes individual chapters with variety tracking (It's getting better. I will give it that)
4. **Review Agent**: Quality checks and revision recommendations (Again, they are optional)

### Generation Flow
```
Title/Subtitle → Chapter Structure → Content Generation → Review → Revision (if needed)
```

### Quality Controls
- Pattern tracking to avoid repetition
- Automated review scoring
- Revision system for low-quality content
- Brand consistency monitoring

## 🗄 Database Schema

Key tables:
- `profiles` - User accounts and roles
- `products` - Book catalog
- `purchases` - Transaction records
- `download_logs` - Download tracking
- `book_generations` - AI generation tracking
- `pattern_tracking` - Content variety enforcement

## 🚀 Deployment

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Supabase Setup
1. Create new Supabase project
2. Run migrations: `npx supabase db push`
3. Configure Storage buckets:
   - `books/free/` - Free sample books
   - `books/individual/` - Individual purchases
   - `books/bundles/` - Bundle packages

### Stripe Configuration
1. Set up products and prices in Stripe Dashboard
2. Configure webhooks pointing to your deployed URL
3. Add webhook signing secret to environment variables

## 🔧 Admin Features

### Book Generation
- Access: `/admin/generate`
- Requires admin role in database
- Full pipeline from title to finished book
- Review and revision capabilities

### Analytics
- Download tracking
- Purchase analytics  
- Generation metrics
- User engagement data

## 🎨 Brand Guidelines

### Tone
- Hyper self-aware about being AI-generated
- Brutally honest about the self-help industry
- Strategic profanity (not gratuitous)
- Accidentally profound subtly embedded in satire
- Break the fourth wall when it's funny

### Content Rules
- Satirical but not mean to readers
- Mock the industry, not the people seeking help
- Any real advice is matched into the chaos
- Avoid repetitive patterns and structures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Content Guidelines
- Maintain the satirical brand voice
- Follow existing pattern-avoidance systems
- Test AI generation changes thoroughly
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

- Email: support@bscribe.ai
- Issues: GitHub Issues tab
- Documentation: This README and code comments

## 🎯 Roadmap
(Claude created this iteself, so who knows if any of this is actually true.)
- [ ] Advanced AI generation with GPT-4 integration
- [ ] User-generated content marketplace
- [ ] Audio book versions with TTS
- [ ] Mobile app for iOS/Android
- [ ] Subscription tiers for unlimited access
- [ ] Creator revenue sharing program

---

*Built with love, sarcasm, and an unhealthy obsession with self-help book parodies.*

**Disclaimer**: This is satirical content for entertainment purposes. BScribe.ai is not responsible for any existential crises, improved self-awareness, or accidental life improvements that may result from reading our books.