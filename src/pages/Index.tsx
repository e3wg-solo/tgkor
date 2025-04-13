import React, { useState, useEffect } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import GamePage from '../components/GamePage';
import { initTelegramWebApp, getTelegramUser, showTelegramAlert } from '../utils/telegram';
import { createGame, joinGame, getGameByUuid } from '../lib/supabase';
import { useSearchParams } from 'react-router-dom';

const Index: React.FC = () => {
  const [gameState, setGameState] = useState<'welcome' | 'game'>('welcome');
  const [gameId, setGameId] = useState<string | undefined>(undefined);
  const [gameData, setGameData] = useState<any | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const gameParam = searchParams.get('game');
  
  useEffect(() => {
    // Initialize Telegram WebApp
    const webApp = initTelegramWebApp();
    const user = getTelegramUser();
    
    if (user) {
      setUserId(user.id.toString());
      setUsername(user.username || `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`);
    } else {
      // For development and testing when not in Telegram
      setUserId('dev-user-' + Math.floor(Math.random() * 10000));
      setUsername('Developer');
    }
    
    // Check for game ID in URL
    if (gameParam) {
      setGameId(gameParam);
    }
    
    setLoading(false);
  }, [gameParam]);
  
  useEffect(() => {
    // Auto-join game if gameId is in URL and we have user info
    if (gameId && userId && username && gameState === 'welcome') {
      handleJoinGame(gameId, userId, username);
    }
  }, [gameId, userId, username, gameState]);
  
  const handleCreateGame = async (userId: string, username: string) => {
    try {
      setLoading(true);
      const newGame = await createGame(userId, username);
      setGameId(newGame.game_uuid);
      setGameData(newGame);
      setGameState('game');
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err instanceof Error ? err.message : 'Failed to create game');
      showTelegramAlert('Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinGame = async (gameId: string, userId: string, username: string) => {
    try {
      setLoading(true);
      const joinedGame = await joinGame(gameId, userId, username);
      setGameId(gameId);
      setGameData(joinedGame);
      setGameState('game');
    } catch (err) {
      console.error('Error joining game:', err);
      setError(err instanceof Error ? err.message : 'Failed to join game');
      showTelegramAlert('Failed to join game. Please make sure the game ID is correct.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackToWelcome = () => {
    setGameState('welcome');
    setGameId(undefined);
    setGameData(null);
    setError(null);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-center">
          {error}
          <button 
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {gameState === 'welcome' ? (
        <WelcomeScreen 
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          userId={userId}
          username={username}
        />
      ) : (
        <GamePage 
          gameId={gameId}
          gameData={gameData}
          userId={userId}
          username={username}
          onBack={handleBackToWelcome}
        />
      )}
    </div>
  );
};

export default Index;
