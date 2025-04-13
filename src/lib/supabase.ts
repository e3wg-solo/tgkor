import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// These environment variables are set in Vercel or your local .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Function to get a game by its UUID
export const getGameByUuid = async (gameUuid: string) => {
  const { data, error } = await supabase
    .from('player_state')
    .select('*')
    .eq('game_uuid', gameUuid)
    .single();
    
  if (error) throw error;
  return data;
};

// Function to create a new game
export const createGame = async (userId: string, username: string) => {
  // Ensure user profile exists
  await ensureProfile(userId, username);
  
  // Create a new game
  const { data, error } = await supabase
    .from('games')
    .insert([{ player1_id: userId }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Function to join an existing game
export const joinGame = async (gameUuid: string, userId: string, username: string) => {
  // Ensure user profile exists
  await ensureProfile(userId, username);
  
  // Get the game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('game_uuid', gameUuid)
    .single();
    
  if (gameError) throw gameError;
  
  // Check if game exists and is in waiting state
  if (!game) throw new Error('Game not found');
  if (game.status !== 'waiting') throw new Error('Game already started or finished');
  if (game.player1_id === userId) throw new Error('You are already in this game as player 1');
  
  // Join the game
  const { error: updateError } = await supabase
    .from('games')
    .update({ 
      player2_id: userId,
      status: 'active',
      current_turn: game.player1_id
    })
    .eq('id', game.id);
    
  if (updateError) throw updateError;
  
  // Create initial positions for both players
  // Player 1 starts at top center (0,4)
  await supabase
    .from('moves')
    .insert([{
      game_id: game.id,
      player_id: game.player1_id,
      move_type: 'move',
      row_from: 0,
      col_from: 4,
      row_to: 0,
      col_to: 4
    }]);
    
  // Player 2 starts at bottom center (8,4)
  await supabase
    .from('moves')
    .insert([{
      game_id: game.id,
      player_id: userId,
      move_type: 'move',
      row_from: 8,
      col_from: 4,
      row_to: 8,
      col_to: 4
    }]);
    
  return await getGameByUuid(gameUuid);
};

// Function to move a player's pawn
export const movePawn = async (gameId: number, userId: string, fromRow: number, fromCol: number, toRow: number, toCol: number) => {
  const { error } = await supabase
    .from('moves')
    .insert([{
      game_id: gameId,
      player_id: userId,
      move_type: 'move',
      row_from: fromRow,
      col_from: fromCol,
      row_to: toRow,
      col_to: toCol
    }]);
    
  if (error) throw error;
  
  // Check win condition (player 1 reaches row 8 or player 2 reaches row 0)
  const { data: game } = await supabase
    .from('games')
    .select('player1_id, player2_id')
    .eq('id', gameId)
    .single();
    
  if (game) {
    let winnerId = null;
    
    if (userId === game.player1_id && toRow === 8) {
      winnerId = userId;
    } else if (userId === game.player2_id && toRow === 0) {
      winnerId = userId;
    }
    
    if (winnerId) {
      await supabase
        .from('games')
        .update({ 
          winner_id: winnerId,
          status: 'finished',
          current_turn: null
        })
        .eq('id', gameId);
    } else {
      // Switch turns
      await supabase
        .from('games')
        .update({ 
          current_turn: userId === game.player1_id ? game.player2_id : game.player1_id
        })
        .eq('id', gameId);
    }
  }
};

// Function to place a wall
export const placeWall = async (gameId: number, userId: string, rowPos: number, colPos: number, orientation: 'horizontal' | 'vertical') => {
  const { error } = await supabase
    .from('walls')
    .insert([{
      game_id: gameId,
      player_id: userId,
      row_pos: rowPos,
      col_pos: colPos,
      orientation: orientation
    }]);
    
  if (error) throw error;
  
  // Switch turns
  const { data: game } = await supabase
    .from('games')
    .select('player1_id, player2_id')
    .eq('id', gameId)
    .single();
    
  if (game) {
    await supabase
      .from('games')
      .update({ 
        current_turn: userId === game.player1_id ? game.player2_id : game.player1_id
      })
      .eq('id', gameId);
  }
};

// Function to ensure a user profile exists
export const ensureProfile = async (userId: string, username: string) => {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  if (!existingProfile) {
    // Create new profile
    const { error } = await supabase
      .from('profiles')
      .insert([{
        user_id: userId,
        username: username
      }]);
      
    if (error) throw error;
  }
};

// Function to subscribe to game updates
export const subscribeToGame = (gameUuid: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`game:${gameUuid}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'games',
      filter: `game_uuid=eq.${gameUuid}`
    }, callback)
    .subscribe();
};

// Function to subscribe to wall updates
export const subscribeToWalls = (gameId: number, callback: (payload: any) => void) => {
  return supabase
    .channel(`walls:${gameId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'walls',
      filter: `game_id=eq.${gameId}`
    }, callback)
    .subscribe();
};

// Function to subscribe to move updates
export const subscribeToMoves = (gameId: number, callback: (payload: any) => void) => {
  return supabase
    .channel(`moves:${gameId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'moves',
      filter: `game_id=eq.${gameId}`
    }, callback)
    .subscribe();
}; 