import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { dailyTaskAPI } from '../services/api';
import { useUserStore } from '../stores/userStore';

interface TaskCompletionProps {
  task: {
    id: string;
    name: string;
    description: string;
    motivationalPhrase?: string;
  };
  visible: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export const TaskCompletion: React.FC<TaskCompletionProps> = ({
  task,
  visible,
  onClose,
  onCompleted,
}) => {
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const { token } = useUserStore();

  const handleComplete = async () => {
    if (!content.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, опишите как вы выполнили задание');
      return;
    }

    setLoading(true);
    try {
      await dailyTaskAPI.completeTask(task.id, content, notes, token || undefined);
      
      Alert.alert(
        'Поздравляем! 🎉', 
        'Задание успешно выполнено! Вы делаете важные шаги на пути развития.',
        [
          {
            text: 'Продолжить',
            onPress: () => {
              onCompleted();
              onClose();
              resetForm();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка завершения задания:', error);
      Alert.alert('Ошибка', 'Не удалось отметить задание как выполненное');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await dailyTaskAPI.skipTask(task.id, skipReason, token || undefined);
      
      Alert.alert(
        'Задание пропущено',
        'Ничего страшного! Завтра у вас будет новая возможность для роста.',
        [
          {
            text: 'Понятно',
            onPress: () => {
              onCompleted();
              onClose();
              resetForm();
              setShowSkipConfirm(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка пропуска задания:', error);
      Alert.alert('Ошибка', 'Не удалось пропустить задание');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setNotes('');
    setSkipReason('');
    setShowSkipConfirm(false);
  };

  const confirmSkip = () => {
    Alert.alert(
      'Пропустить задание?',
      'Вы уверены, что хотите пропустить это задание? Лучше попробовать выполнить его хотя бы частично.',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Пропустить',
          style: 'destructive',
          onPress: () => setShowSkipConfirm(true),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Отчёт о выполнении</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
            {task.motivationalPhrase && (
              <View style={styles.motivationContainer}>
                <Text style={styles.motivationText}>"{task.motivationalPhrase}"</Text>
              </View>
            )}
          </View>

          {!showSkipConfirm ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Как вы выполнили задание? <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Опишите что вы сделали, как прошло выполнение, что чувствовали..."
                  placeholderTextColor="#666"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Дополнительные заметки</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ваши мысли, выводы, планы на будущее..."
                  placeholderTextColor="#666"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.completeButton, !content.trim() && styles.disabledButton]}
                onPress={handleComplete}
                disabled={loading || !content.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.completeButtonText}>Задание выполнено! ✅</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={confirmSkip}
                disabled={loading}
              >
                <Text style={styles.skipButtonText}>Пропустить задание</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.skipForm}>
              <Text style={styles.skipTitle}>Почему пропускаете задание?</Text>
              <Text style={styles.skipSubtitle}>
                Это поможет лучше понять ваши потребности
              </Text>
              
              <TextInput
                style={styles.textArea}
                placeholder="Например: не хватило времени, слишком сложно, не подходит сейчас..."
                placeholderTextColor="#666"
                value={skipReason}
                onChangeText={setSkipReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.confirmSkipButton}
                onPress={handleSkip}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmSkipButtonText}>Пропустить</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelSkipButton}
                onPress={() => setShowSkipConfirm(false)}
                disabled={loading}
              >
                <Text style={styles.cancelSkipButtonText}>Вернуться к выполнению</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  taskInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  taskName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  motivationContainer: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  motivationText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#8B4513',
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#e74c3c',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
  },
  completeButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  skipButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
  skipForm: {
    gap: 16,
  },
  skipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  skipSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confirmSkipButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmSkipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelSkipButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  cancelSkipButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '500',
  },
}); 