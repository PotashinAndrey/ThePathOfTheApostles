export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  gold: string;
  spiritual: string;
}

export interface Theme {
  colors: Colors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#2E4057',     // Темно-синий, символизирующий глубину веры
    secondary: '#8B4513',   // Коричневый, цвет земли и стабильности
    background: '#FEFEFE',  // Чистый белый
    surface: '#F8F9FA',     // Очень светло-серый
    text: '#2C3E50',        // Темно-серый для основного текста
    textSecondary: '#6C757D', // Серый для второстепенного текста
    border: '#E9ECEF',      // Светло-серая граница
    success: '#28A745',     // Зеленый успеха
    warning: '#FFC107',     // Золотистый предупреждения
    error: '#DC3545',       // Красный ошибки
    gold: '#FFD700',        // Золотой - символ божественного
    spiritual: '#6B46C1',   // Фиолетовый - цвет духовности
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    primary: '#4A90E2',     // Светло-синий для темной темы
    secondary: '#D2691E',   // Более светлый коричневый
    background: '#121212',  // Глубокий черный
    surface: '#1E1E1E',     // Темно-серый
    text: '#FFFFFF',        // Белый текст
    textSecondary: '#B0B0B0', // Светло-серый для второстепенного текста
    border: '#2C2C2C',      // Темно-серая граница
    success: '#4CAF50',     // Зеленый успеха
    warning: '#FF9800',     // Оранжевый предупреждения
    error: '#F44336',       // Красный ошибки
    gold: '#FFD700',        // Золотой остается тем же
    spiritual: '#9C27B0',   // Более яркий фиолетовый для темной темы
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
  },
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
};

export type ThemeMode = 'light' | 'dark';

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'light' ? lightTheme : darkTheme;
}; 