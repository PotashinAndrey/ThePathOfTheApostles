export type RootTabParamList = {
  Home: undefined;
  Path: { screen?: string; params?: any };
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
  DailyTask: {
    taskId: string;
    task?: any;
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

export type PathStackParamList = {
  PathMain: undefined;
  PathTask: {
    task: any;
    block: any;
  };
}; 