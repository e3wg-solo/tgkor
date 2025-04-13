# Telegram Quoridor Quest

A digital implementation of the strategy board game Quoridor for Telegram Mini Apps, built with React, TypeScript, and Supabase.

## Project Overview

Quoridor Quest is a two-player strategy board game where players take turns either moving their pawn or placing walls. The goal is to reach the opposite side of the board before your opponent.

- Built with Vite, React, TypeScript
- Uses Supabase for backend database and realtime communication
- Integrates with Telegram Mini Apps
- Realtime multiplayer gameplay

## Development Setup

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [Supabase account](https://supabase.com/)
- [Telegram Bot account](https://core.telegram.org/bots#creating-a-new-bot)

### Install Dependencies

```sh
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

### Run Development Server

```sh
npm run dev
```

## Supabase Setup

1. Create a new Supabase project
2. Run the migration script in `supabase/migrations/20240909123000_create_quoridor_tables.sql` to set up the database schema

### Supabase Database Schema

The game uses the following tables:
- `profiles` - Player information
- `games` - Game sessions
- `moves` - Player movements
- `walls` - Wall placements

## Telegram Bot Setup

1. Create a new bot using [BotFather](https://t.me/botfather)
2. Configure the bot to support Mini Apps:
   ```
   /mybots > Select your bot > Bot Settings > Mini Apps
   ```
3. Add your deployed app URL as a Mini App

## Vercel Deployment

### Deployment Setup

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the following environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TELEGRAM_BOT_USERNAME`
4. Deploy the application

### Usage with Telegram

After deploying to Vercel, update your Telegram bot's Mini App settings with your Vercel deployment URL.

## Game Rules

- Players take turns either moving their pawn or placing a wall
- The first player to reach the opposite side of the board wins
- Each player has 10 walls to place strategically
- Walls can block opponent's path but cannot completely trap a player
- Players must always have a path to the goal

## License

This project is licensed under the MIT License.
