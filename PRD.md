Meedro AI - WhiteBoard


Goal: The primary goal of Meedro WhiteBoard is to provide a dynamic, data-driven, visual workspace designed for content creators, marketers, and creative agencies. The application will empower users to aggregate various digital assets (videos, articles, social media content) on an infinite canvas. By integrating a powerful AI assistant that works directly with scraped and transcribed content, Meedro will streamline the creative process, transforming disparate online sources into structured, actionable insights and creative projects.

Planning: The development is planned in phased iterations to build a robust and scalable application.

Phase 1: Core Functionality & Direct AI (In Progress)

Develop the core whiteboard interface with an infinite, pannable, and zoomable canvas.
Implement draggable and resizable "window" frames for content.
Support embedding various content types: YouTube, TikTok, Instagram, documents, images, and general URLs.


Phase 2: Backend Integration (Supabase & Apify)

Integrate Supabase for User Authentication: Implement user sign-up, login, and profile management.
Set up Supabase Database: Design and implement the database schema to store user data, whiteboards, window items, and their scraped content/transcripts. Each user's whiteboard data will be private and persistent.
Integrate Apify for Content Scraping: Create Genkit flows that trigger Apify actors to fetch content from URLs (e.g., get a YouTube video transcript, scrape text from an article).
Store the scraped content and transcripts in the Supabase database, linked to the corresponding window item.

Phase 3: Enhanced AI & Database-Driven Context

Modify the AI Assistant to pull context directly from the Supabase database (e.g., using stored transcripts) instead of relying on raw URLs.
Develop dedicated Genkit flows for specific AI tasks that leverage the scraped data (e.g., `summarizeArticle`, `generateTweetIdeasFromVideo`).
Implement a mechanism for users to refresh the content of a window, triggering a new scrape from Apify.

Phase 4: Collaboration & Sharing

Implement real-time multi-user collaboration on the same whiteboard (leveraging Supabase's real-time capabilities).
Add commenting features on windows.
Enable sharing of whiteboards via a public link (read-only) or by inviting other registered users (edit access).

Phase 5: Billing
Develop Credit usage limits.(connected to Meedro AI User Subscription)


Requirements/System Components:

Functional Requirements: 
User Accounts: Users must be able to sign up, log in, and have their whiteboards saved to their account.
Data Persistence: All whiteboard items, positions, and content must be stored in a database and associated with the user.
Automated Content Scraping: When a user adds a link, the system must automatically use a service like Apify to fetch the relevant content (e.g., transcript, article text While Visual Loading To Let the User know the Content being Scraped).
Database-backed AI Context: The AI assistant must use the clean, scraped content from the database as its context for generating responses.
Whiteboard Canvas: Users must be able to pan, zoom, and add content windows to the canvas.
Content Windows: Each window must be independently draggable, resizable, and deletable.

Technical Components: 
Frontend:
Framework: Next.js with React (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: ShadCN UI
Backend / AI:
AI Toolkit: Genkit
AI Models: Direct integration with OpenAI
Data & Auth:
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
Content Scraping:
Service: Apify (for fetching content from social media, websites, etc.)
Deployment:
Hosting: Vercel

Workflow:


User Login: The user signs up or logs into their Meedro account.
Add Content: The user adds a link (e.g., a YouTube video, a blog post URL) to the whiteboard.
Automated Scraping: The application triggers an Apify actor via a Genkit flow. The actor visits the URL, scrapes the relevant content (e.g., video transcript, article text), and returns it.
Store in Database: The Genkit flow receives the scraped content and saves it to the Supabase database, associating it with the new window item and the current user.
Organize & Connect: The user arranges the content windows on the canvas and connects them to the AI Assistant to create a context.
Interact with AI: The user prompts the AI Assistant (e.g., "Write a TikTok script based on the attached video and article.").
Generate Response: The AI Assistant's Genkit flow retrieves the pre-scraped transcripts and text from the Supabase database for the connected windows. It sends this clean data as context to the AI model (e.g., GPT-4o).
Display Output: The application receives the generated response and displays it in the AI chat window.



Steps to Implement:


page.tsx (Main Page): Will be updated to manage user authentication state. It will fetch and display the whiteboard data for the logged-in user.
Genkit Flows (e.g., `generate-script-from-context.ts`): Modify existing flows to remove webhook logic and interact directly with an AI model.
Supabase Integration (`/lib/supabase`): Create client and server helpers for interacting with Supabase.
Auth Components (`/components/auth`): Create login, signup, and user profile components.
Apify Scraper Flow (`/ai/flows/scrape-content.ts`): Genkit flow that takes a URL, calls the appropriate Apify actor, and returns the scraped content.
`sidebar.tsx` & `page.tsx`: When a user adds a new item, it should now call the `scrape-content` flow and then save the item along with its scraped content to Supabase.
`ai-chat-window.tsx`: Modify the chat component to fetch context for connected windows directly from the database before calling the `generateScriptFromContext` flow.
