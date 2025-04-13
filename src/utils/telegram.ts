// Types for Telegram WebApp
export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean; }) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink: (url: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  openTelegramLink: (url: string) => void;
  CloudStorage: {
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void;
    setItem: (key: string, value: string, callback: (error: Error | null, success: boolean) => void) => void;
    removeItem: (key: string, callback: (error: Error | null, success: boolean) => void) => void;
    getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string | null>) => void) => void;
    removeItems: (keys: string[], callback: (error: Error | null, success: boolean) => void) => void;
    getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
  };
};

// Mock data for development environment
const mockTelegramUser: TelegramUser = {
  id: 12345678,
  first_name: "Test",
  last_name: "User",
  username: "testuser",
  language_code: "en",
  is_premium: false
};

const mockTelegramWebApp: TelegramWebApp = {
  initData: "mock_init_data",
  initDataUnsafe: {
    user: mockTelegramUser,
    auth_date: Math.floor(Date.now() / 1000),
    hash: "mock_hash"
  },
  version: "6.0",
  platform: "web",
  colorScheme: 'light',
  themeParams: {
    bg_color: "#ffffff",
    text_color: "#000000",
    button_color: "#40a7e3",
    button_text_color: "#ffffff"
  },
  isExpanded: true,
  viewportHeight: window.innerHeight,
  viewportStableHeight: window.innerHeight,
  MainButton: {
    text: "",
    color: "#40a7e3",
    textColor: "#ffffff",
    isVisible: false,
    isActive: true,
    isProgressVisible: false,
    setText: () => {},
    onClick: () => {},
    show: () => {},
    hide: () => {},
    enable: () => {},
    disable: () => {},
    showProgress: () => {},
    hideProgress: () => {},
    setParams: () => {}
  },
  BackButton: {
    isVisible: false,
    onClick: () => {},
    show: () => {},
    hide: () => {}
  },
  ready: () => {},
  expand: () => {},
  close: () => {},
  openLink: () => {},
  showAlert: () => {},
  showConfirm: () => {},
  openTelegramLink: () => {},
  CloudStorage: {
    getItem: () => {},
    setItem: () => {},
    removeItem: () => {},
    getItems: () => {},
    removeItems: () => {},
    getKeys: () => {}
  }
};

// Development mode flag - change to false when deploying to production
const DEVELOPMENT_MODE = import.meta.env.DEV || false;

// Get the Telegram WebApp object from the window
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined') {
    // Return real Telegram WebApp if available
    const realWebApp = (window as any).Telegram?.WebApp;
    
    if (realWebApp) {
      console.log("Using real Telegram WebApp");
      return realWebApp;
    }
    
    // Return mock data in development mode
    if (DEVELOPMENT_MODE) {
      console.log("Using mock Telegram WebApp (development mode)");
      return mockTelegramWebApp;
    }
  }
  return null;
};

// Get the current user from Telegram WebApp
export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  
  // Return real user if available
  if (webApp?.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user;
  }
  
  // Return mock user in development mode
  if (DEVELOPMENT_MODE) {
    console.log("Using mock Telegram user (development mode)");
    return mockTelegramUser;
  }
  
  return null;
};

// Initialize the Telegram WebApp
export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  
  if (webApp) {
    // Set the app as ready
    webApp.ready();
    
    // Expand the WebApp to take full height
    if (!webApp.isExpanded) {
      webApp.expand();
    }
    
    // Apply theme (light/dark)
    const theme = webApp.colorScheme || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    return webApp;
  }
  
  if (DEVELOPMENT_MODE) {
    console.log("Using mock Telegram environment (development mode)");
    return mockTelegramWebApp;
  }
  
  console.error("Telegram WebApp is not available");
  return null;
};

// Share game link with Telegram users
export const shareTelegramGame = (gameId: string) => {
  const webApp = getTelegramWebApp();
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  
  if (webApp) {
    // Create a deep link to the game
    const gameUrl = `https://t.me/${botUsername}?start=game_${gameId}`;
    
    try {
      // Use native sharing if available
      webApp.openTelegramLink(gameUrl);
    } catch (error) {
      // Fallback to alert with copy prompt
      webApp.showAlert(`Share this link to invite a friend: ${gameUrl}`);
    }
  } else if (DEVELOPMENT_MODE) {
    // Development mode fallback
    alert(`In production, this would share: t.me/${botUsername}?start=game_${gameId}`);
  }
};

// Show a Telegram native alert
export const showTelegramAlert = (message: string, callback?: () => void) => {
  const webApp = getTelegramWebApp();
  
  if (webApp) {
    webApp.showAlert(message, callback);
  } else if (DEVELOPMENT_MODE) {
    alert(message);
    if (callback) callback();
  }
};

// Show a Telegram native confirmation dialog
export const showTelegramConfirm = (message: string, callback: (confirmed: boolean) => void) => {
  const webApp = getTelegramWebApp();
  
  if (webApp) {
    webApp.showConfirm(message, callback);
  } else if (DEVELOPMENT_MODE) {
    const confirmed = window.confirm(message);
    callback(confirmed);
  }
};
