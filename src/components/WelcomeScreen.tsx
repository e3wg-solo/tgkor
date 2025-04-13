import React, { useState, useEffect } from 'react';
import { getTelegramUser, initTelegramWebApp, TelegramUser, shareTelegramGame } from '../utils/telegram';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface WelcomeScreenProps {
  onCreateGame: (userId: string, username: string) => void;
  onJoinGame: (gameId: string, userId: string, username: string) => void;
  userId: string;
  username: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onCreateGame, 
  onJoinGame,
  userId,
  username
}) => {
  const [gameIdInput, setGameIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleCreateGame = () => {
    setLoading(true);
    onCreateGame(userId, username);
  };
  
  const handleJoinGame = () => {
    if (gameIdInput) {
      setLoading(true);
      onJoinGame(gameIdInput, userId, username);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Quoridor</CardTitle>
          <CardDescription>Strategy Board Game for Telegram</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 text-center">
            <p className="text-lg">Welcome, <span className="font-bold">{username}</span>!</p>
            <p className="text-sm text-muted-foreground mt-1">Ready to play?</p>
          </div>
          
          <div className="space-y-6">
            <Button 
              onClick={handleCreateGame}
              className="w-full py-6 text-lg"
              size="lg"
            >
              Create New Game
            </Button>
            
            <div className="flex flex-col space-y-2">
              <Input
                type="text"
                value={gameIdInput}
                onChange={(e) => setGameIdInput(e.target.value)}
                placeholder="Enter Game ID"
                className="w-full p-4"
              />
              
              <Button 
                onClick={handleJoinGame}
                disabled={!gameIdInput}
                variant="outline"
                className="w-full py-6 text-lg"
                size="lg"
              >
                Join Game
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <div className="w-full p-4 bg-muted rounded-lg mt-4">
            <h2 className="text-xl font-bold mb-2">How to Play</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Move your pawn to the opposite side of the board to win</li>
              <li>On your turn, either move your pawn or place a wall</li>
              <li>Walls block movement but cannot completely block a player's path</li>
              <li>Each player has 10 walls to place</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
