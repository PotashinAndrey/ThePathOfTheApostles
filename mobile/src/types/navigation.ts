export type RootTabParamList = {
  Home: undefined;
  Path: { pathId?: string };
  Chat: { screen?: string; params?: any };
  Missions: undefined;
  ProfileTab: { screen?: string };
};

export type ChatStackParamList = {
  ChatsList: undefined;
  ChatDetail: {
    chatId?: string;
    apostleId?: string;
  };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Notifications: undefined;
  Achievements: undefined;
  Subscriptions: undefined;
  Apostles: undefined;
}; 