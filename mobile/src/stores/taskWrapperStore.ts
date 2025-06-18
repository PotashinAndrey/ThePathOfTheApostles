import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../utils/storage';
import { TaskWrapperInfo } from '../types/api';
import apiService from '../services/apiNew';

interface TaskWrapperState {
  taskWrappers: TaskWrapperInfo[];
  activeTaskWrappers: TaskWrapperInfo[];
  completedTaskWrappers: TaskWrapperInfo[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: number | null;
  
  // Actions
  loadTaskWrappers: () => Promise<void>;
  refreshTaskWrappers: () => Promise<void>;
  getTaskWrapper: (id: string) => TaskWrapperInfo | null;
  
  // Task operations
  activateTaskWrapper: (id: string) => Promise<void>;
  completeTaskWrapper: (id: string, content?: string) => Promise<void>;
  skipTaskWrapper: (id: string, reason?: string) => Promise<void>;
  
  // State updates
  updateTaskWrapperInState: (id: string, updates: Partial<TaskWrapperInfo>) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
}

export const useTaskWrapperStore = create<TaskWrapperState>()(
  persist(
    (set, get) => ({
      taskWrappers: [],
      activeTaskWrappers: [],
      completedTaskWrappers: [],
      isLoading: false,
      isRefreshing: false,
      lastUpdated: null,

      loadTaskWrappers: async () => {
        const state = get();
        if (state.isLoading) return; // Предотвращаем множественные загрузки
        
        try {
          set({ isLoading: true });
          console.log('🔄 TaskWrapperStore: Загружаем TaskWrappers...');
          
          const allTaskWrappers = await apiService.getAllTaskWrappers();
          console.log('📝 TaskWrapperStore: Получено заданий:', allTaskWrappers.length);
          
          // Фильтруем по статусу
          const activeTasks = allTaskWrappers.filter(tw => tw.isActive && !tw.isCompleted);
          const completedTasks = allTaskWrappers.filter(tw => tw.isCompleted);
          
          console.log('⚡ TaskWrapperStore: Активных заданий:', activeTasks.length);
          console.log('✅ TaskWrapperStore: Завершенных заданий:', completedTasks.length);
          
          set({
            taskWrappers: allTaskWrappers,
            activeTaskWrappers: activeTasks,
            completedTaskWrappers: completedTasks,
            lastUpdated: Date.now(),
          });
          
        } catch (error) {
          console.error('❌ TaskWrapperStore: Ошибка загрузки заданий:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      refreshTaskWrappers: async () => {
        const state = get();
        if (state.isRefreshing) return; // Предотвращаем множественные обновления
        
        try {
          set({ isRefreshing: true });
          console.log('🔄 TaskWrapperStore: Обновляем TaskWrappers...');
          
          const allTaskWrappers = await apiService.getAllTaskWrappers();
          
          // Фильтруем по статусу
          const activeTasks = allTaskWrappers.filter(tw => tw.isActive && !tw.isCompleted);
          const completedTasks = allTaskWrappers.filter(tw => tw.isCompleted);
          
          set({
            taskWrappers: allTaskWrappers,
            activeTaskWrappers: activeTasks,
            completedTaskWrappers: completedTasks,
            lastUpdated: Date.now(),
          });
          
          console.log('✅ TaskWrapperStore: Данные обновлены');
          
        } catch (error) {
          console.error('❌ TaskWrapperStore: Ошибка обновления заданий:', error);
          throw error;
        } finally {
          set({ isRefreshing: false });
        }
      },

      getTaskWrapper: (id: string) => {
        const state = get();
        return state.taskWrappers.find(tw => tw.id === id) || null;
      },

      activateTaskWrapper: async (id: string) => {
        try {
          console.log('⚡ TaskWrapperStore: Активируем TaskWrapper:', id);
          
          await apiService.activateTaskWrapper(id);
          
          // Оптимистично обновляем состояние
          get().updateTaskWrapperInState(id, { 
            isActive: true, 
            isAvailable: true 
          });
          
          // Полностью перезагружаем данные для синхронизации
          await get().refreshTaskWrappers();
          
          console.log('✅ TaskWrapperStore: TaskWrapper активирован');
          
        } catch (error) {
          console.error('❌ TaskWrapperStore: Ошибка активации TaskWrapper:', error);
          // В случае ошибки перезагружаем актуальные данные
          await get().refreshTaskWrappers();
          throw error;
        }
      },

      completeTaskWrapper: async (id: string, content?: string) => {
        try {
          console.log('✅ TaskWrapperStore: Завершаем TaskWrapper:', id);
          
          await apiService.completeTaskWrapper(id, content);
          
          // Оптимистично обновляем состояние
          get().updateTaskWrapperInState(id, { 
            isCompleted: true,
            isActive: false
          });
          
          // Полностью перезагружаем данные для синхронизации
          await get().refreshTaskWrappers();
          
          console.log('✅ TaskWrapperStore: TaskWrapper завершен');
          
        } catch (error) {
          console.error('❌ TaskWrapperStore: Ошибка завершения TaskWrapper:', error);
          // В случае ошибки перезагружаем актуальные данные
          await get().refreshTaskWrappers();
          throw error;
        }
      },

      skipTaskWrapper: async (id: string, reason?: string) => {
        try {
          console.log('⏭️ TaskWrapperStore: Пропускаем TaskWrapper:', id);
          
          await apiService.skipTaskWrapper(id, reason);
          
          // Оптимистично обновляем состояние (пропущенная задача становится неактивной)
          get().updateTaskWrapperInState(id, { 
            isActive: false
          });
          
          // Полностью перезагружаем данные для синхронизации
          await get().refreshTaskWrappers();
          
          console.log('✅ TaskWrapperStore: TaskWrapper пропущен');
          
        } catch (error) {
          console.error('❌ TaskWrapperStore: Ошибка пропуска TaskWrapper:', error);
          // В случае ошибки перезагружаем актуальные данные
          await get().refreshTaskWrappers();
          throw error;
        }
      },

      updateTaskWrapperInState: (id: string, updates: Partial<TaskWrapperInfo>) => {
        set((state) => {
          const updatedTaskWrappers = state.taskWrappers.map(tw =>
            tw.id === id ? { ...tw, ...updates } : tw
          );
          
          // Пересчитываем фильтрованные списки
          const activeTasks = updatedTaskWrappers.filter(tw => tw.isActive && !tw.isCompleted);
          const completedTasks = updatedTaskWrappers.filter(tw => tw.isCompleted);
          
          return {
            taskWrappers: updatedTaskWrappers,
            activeTaskWrappers: activeTasks,
            completedTaskWrappers: completedTasks,
          };
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setRefreshing: (refreshing: boolean) => {
        set({ isRefreshing: refreshing });
      },
    }),
    {
      name: 'task-wrapper-storage',
      storage: createJSONStorage(() => storage),
      // Не сохраняем состояния загрузки
      partialize: (state) => ({
        taskWrappers: state.taskWrappers,
        activeTaskWrappers: state.activeTaskWrappers,
        completedTaskWrappers: state.completedTaskWrappers,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
); 