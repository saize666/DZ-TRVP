import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Box} from '@mui/material';

const AddExercise = ({ Exercise, setExercises, setErrorMessage, setSuccessMessage }) => {
  const [ExerciseName, setExerciseName] = useState('');
  const [ExerciseType, setExerciseType] = useState('');
  const [ExerciseTime, setExerciseTime] = useState(''); // Начальное значение пустое

  const handleAddExercise = () => {
    // Проверка всех полей
    if (!ExerciseName || !ExerciseType || !ExerciseTime.trim()) {
      setErrorMessage('Пожалуйста, укажите название, тип и время упражнения');
      return;
    }

    const time = parseInt(ExerciseTime.trim(), 10); // Преобразуем строку в число и обрезаем пробелы
    if (isNaN(time) || time <= 0) {
      setErrorMessage('Время должно быть положительным числом');
      return;
    }

    // Проверка на существование упражнения
    const existingExercise = Exercise.find(exercise => exercise.name === ExerciseName);
    if (existingExercise) {
      setErrorMessage('Упражнение с таким названием уже существует');
      return;
    }

    // Отправка данных на сервер
    axios.post('http://localhost:3001/api/Exercise', { 
      name: ExerciseName, 
      complexity: ExerciseType, 
      time: parseInt(ExerciseTime.trim(), 10) // Убедись, что время передается как число
    })
      .then((response) => {
        setExercises([...Exercise, response.data]);
        setSuccessMessage('Упражнение успешно добавлено');
        setExerciseName('');
        setExerciseType('');
        setExerciseTime('');
        setErrorMessage('');
      })
      .catch(() => setErrorMessage('Ошибка при добавлении упражнения'));
  };

  // Обработчик для ввода только чисел
  const handleTimeInput = (e) => {
    // Разрешаем только числа и пустую строку (для удаления значения)
    const regex = /^[0-9\b]+$/;
    if (e.target.value === '' || regex.test(e.target.value)) {
      setExerciseTime(e.target.value);
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2}}>
      <Typography variant="h6" gutterBottom>
              Добавить упражнение
            </Typography>
          <TextField
            label="Название упражнения"
            variant="outlined"
            value={ExerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Тип упражнения"
            variant="outlined"
            value={ExerciseType}
            onChange={(e) => setExerciseType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Время выполнения"
            type="text" // Ставим type="text" для обработки через регулярное выражение
            variant="outlined"
            value={ExerciseTime}
            onChange={handleTimeInput} // Используем handleTimeInput для фильтрации ввода
            fullWidth
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="green" 
              onClick={handleAddExercise} 
              disabled={!ExerciseName || !ExerciseType || !ExerciseTime.trim() || isNaN(parseInt(ExerciseTime, 10)) || parseInt(ExerciseTime, 10) <= 0}
              sx={{ width: 'auto' }}
            >
              Добавить упражнение
            </Button>
          </Box>
    </Box>
  );
};

export default AddExercise;