import React, { useState } from 'react';
import axios from 'axios';
import './Card.css'; // Импорт стилей
import { Card as MuiCard, CardActions, Typography, Button, Select, MenuItem, Box, TextField, } from '@mui/material';
  
const Card = ({ data, setErrorMessage, setSuccessMessage, Trainings, setTrainings, AllExercises }) => {
  const { name, Exercise, training_id, time } = data;
  console.log("NIGGER2", data);
  const [selectedExercises, setSelectedExercises] = useState({ Tag: "" });
  const [selectedTrainingID, setSelectedTrainingID] = useState('');
  const [selectedTrainingIDs, setSelectedTrainingIDs] = useState({});
  console.log('Массив Exercise:', Exercise);
  console.log('Массив AllExercise:', AllExercises);


  const handleDeleteExerciseFromTraining = (exercise_id) => {
  
    if (!training_id || !exercise_id) {
      setErrorMessage('Некорректные данные для удаления упражнения');
      return;
    }
  
    axios.delete(`http://localhost:3001/api/TrainingExercises/${training_id}/${exercise_id}`)
      .then(() => {
        setSuccessMessage('Упражнение успешно удалено из тренировки');
        window.location.reload();
      })
      .catch((error) => {
        console.error('Ошибка при удалении упражнения:', error);
        setErrorMessage('Ошибка при удалении упражнения из тренировки');
      });
  };
  

  const handleDeleteTraining = (training_id) => {
    if (!training_id) {
      setErrorMessage('Невозможно удалить тренировку: отсутствует идентификатор');
      return;
    }
  
    axios.delete(`http://localhost:3001/api/Trainings/${training_id}`)
      .then(() => {
        // Удаляем вариант тренировки из состояния
        setTrainings(Trainings.filter((training) => training.id !== parseInt(training_id)));
        setErrorMessage('');
        window.location.reload();
        setSuccessMessage('Вариант тренировки успешно удален');
      })
      .catch((error) => {
        // Логируем ошибку для отладки
        console.error('Error during deletion:', error);
        setErrorMessage('Ошибка при удалении тренировки');
      });
  };
  
  const handleMoveExerciseToAnotherTraining = (exerciseID, selectedTrainingID) => {
    const selectedExercise = AllExercises.find((exercise) => exercise.id === exerciseID);
    const targetTraining = Trainings.find(
      (training) => training.training_id === parseInt(selectedTrainingID)
    );
  
    if (!selectedExercise || !targetTraining) {
      setErrorMessage('Ошибка: выбранное упражнение или тренировка не найдены.');
      return;
    }
  
    // Проверка на превышение времени
    const targetTotalTime = targetTraining.Exercise.reduce(
      (sum, exercise) => sum + (exercise.time || 0),
      0
    );
  
    const newTotalTime = targetTotalTime + selectedExercise.time;
  
    if (newTotalTime > targetTraining.time) {
      setErrorMessage('Ошибка: суммарное время упражнений превышает длительность целевой тренировки.');
      return;
    }
  
    // Проверка на уровень сложности
    const selectedDifficulty = selectedExercise.difficulty;
    const allowedDifficulty = targetTraining.difficulty;
    if (selectedDifficulty > allowedDifficulty) {
      setErrorMessage(
        `Ошибка: сложность упражнения (${selectedDifficulty}) превышает уровень сложности целевой тренировки (${allowedDifficulty}).`
      );
      return;
    }
  
    axios.post(`http://localhost:3001/api/MoveExercise/${exerciseID}`, {
      selectedTrainingID: parseInt(selectedTrainingID),
      prevVariantId: training_id,
    })
      .then(() => {
        setSuccessMessage('Тренировка успешно обновлена.');
        setErrorMessage('');
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage('Ошибка при перемещении упражнения в тренировку.');
      });
  };
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    const selectedExercise = AllExercises.find(exercise => exercise.id === parseInt(value));
    if (!selectedExercise) {
      setErrorMessage('Ошибка: упражнение не найдено.');
      return;
    }

    // const selectedExerciseType = selectedExercise.complexity;
    // const existingDish = Exercise.find(exercise => exercise.complexity === selectedExerciseType);
    // if (existingDish) {
    //   setErrorMessage(`Ошибка: данное упражнение уже существует в этой тренировке.`);
    //   setSelectedExercises(prevData => ({
    //     ...prevData,
    //     [name]: "" // Сбросить выбор
    //   }));
    //   return;
    // }

    setErrorMessage('');
    setSelectedExercises((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMove = (exerciseID, newTrainingID) => {
    const selectedExercise = AllExercises.find((exercise) => exercise.id === parseInt(exerciseID));
    if (!selectedExercise) {
      setErrorMessage('Ошибка: упражнение не найдено.');
      return;
    }
  
    const targetTraining = Trainings.find(
      (training) => training.training_id === parseInt(newTrainingID)
    );
    if (!targetTraining) {
      setErrorMessage('Ошибка: выбранный вариант тренировки не существует.');
      return;
    }
  
    // Проверка на превышение времени
    const currentTotalTime = targetTraining.Exercise.reduce(
      (sum, exercise) => sum + (exercise.time || 0),
      0
    );
    const newTotalTime = currentTotalTime + selectedExercise.time;
  
    if (newTotalTime > targetTraining.time) {
      setErrorMessage(
        `Ошибка: общее время упражнений (${newTotalTime} мин.) превышает длительность тренировки (${targetTraining.time} мин.).`
      );
      return;
    }
  
    // Проверка на сложность
    const selectedDifficulty = selectedExercise.difficulty;
    const allowedDifficulty = targetTraining.difficulty;
    if (selectedDifficulty > allowedDifficulty) {
      setErrorMessage(
        `Ошибка: сложность упражнения (${selectedDifficulty}) превышает уровень сложности целевой тренировки (${allowedDifficulty}).`
      );
      return;
    }
  
    setSelectedTrainingID(newTrainingID);
    setErrorMessage('');
    setSelectedTrainingIDs((prevState) => ({
      ...prevState,
      [exerciseID]: newTrainingID,
    }));
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!selectedExercises.Tag) {
      setErrorMessage('Ошибка: выберите упражнение для добавления.');
      setSuccessMessage('');
      return;
    }
  
    const selectedExercise = AllExercises.find(
      (exercise) => exercise.id === parseInt(selectedExercises.Tag)
    );
  
    if (!selectedExercise) {
      setErrorMessage('Ошибка: упражнение не найдено.');
      return;
    }
  
    // Проверяем текущую сложность
    const currentComplexity = Exercise.reduce(
      (sum, exercise) => sum + (exercise.complexity || 0),
      0
    );
  
    const newComplexity = currentComplexity + selectedExercise.complexity;
  
    if (newComplexity > 10) {
      setErrorMessage(
        `Ошибка: суммарная сложность упражнений (${newComplexity}) превышает допустимое значение (10).`
      );
      setSuccessMessage('');
      return;
    }
  
    // Проверяем текущее время
    const currentTotalTime = Exercise.reduce(
      (sum, exercise) => sum + (exercise.time || 0),
      0
    );
  
    const newTotalTime = currentTotalTime + selectedExercise.time;
    console.log(currentTotalTime);
    console.log(selectedExercise.time);
    if (newTotalTime > time) {
      setErrorMessage(
        `Ошибка: общее время упражнений (${newTotalTime} мин.) превышает длительность тренировки (${time} мин.).`
      );
      setSuccessMessage('');
      return;
    }
  
    // Если все проверки пройдены
    try {
      const response = await fetch(
        `http://localhost:3001/api/AddExerciseToTraining/${training_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedExercises),
        }
      );
  
      if (response.ok) {  
        setSuccessMessage('Упражнение успешно добавлено в тренировку.');
        setErrorMessage('');
        window.location.reload();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Ошибка при добавлении упражнения в тренировку.');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Ошибка при добавлении упражнения:', error);
      setErrorMessage('Ошибка при добавлении упражнения в тренировку.');
      setSuccessMessage('');
    }
  };
   
  
  
  return (
    <MuiCard sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {name} - Продолжительность {time} мин.
      </Typography>

      <div className="Exercise-list">
        {Exercise.length > 0 &&
          Exercise.filter((exercise) => exercise.exercise_id !== null).map((exercise, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
              }}
              className="exercise-card"
            >
              <div className="exercise-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" className="exercise-name">
                  {exercise.exercise_name} - Сложность: {exercise.complexity} - Время: {exercise.exercise_time}
                </Typography>

                <div className="exercise-actions">
                  <Button
                    onClick={() => handleDeleteExerciseFromTraining(exercise.exercise_id)}
                    className="action-button delete-button"
                    variant="contained"
                    title="Удалить"
                  >
                    Удалить
                  </Button>
                  <Button
                    onClick={() =>
                      handleMoveExerciseToAnotherTraining(exercise.exercise_id, selectedTrainingID)
                    }
                    className="action-button move-button"
                    variant="contained"
                    title="Переместить"
                  >
                    Переместить
                  </Button>
                </div>
              </div>
              
              <div className="exercise-footer" style={{ marginTop: '16px' }}>
                <Select
                  value={selectedTrainingIDs[exercise.exercise_id] || ''}
                  onChange={(e) => handleMove(exercise.exercise_id, e.target.value)}
                  size="small"
                  fullWidth
                  sx={{
                    minWidth: '200px',
                  }}
                  className="TrainingAndExercise-select"
                >
                  <MenuItem value="">Выберите тренировку</MenuItem>
                  {Trainings.filter((variant) => variant.training_id !== training_id).map((variant) => (
                    <MenuItem key={variant.training_id} value={variant.training_id}>
                      {variant.name} - Продолжительность {variant.time} мин.
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </Box>
          ))}
      </div>

      <form onSubmit={handleSubmit} className="add-exercise-form" style={{ marginTop: '16px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 2, maxWidth: 300, margin: '0 auto' }}>
          <TextField
            select
            label="Добавить упражнение"
            name="Tag"
            value={selectedExercises.Tag}
            onChange={handleChange}
            fullWidth
            sx={{
              maxWidth: '100%',
            }}
          >
            {AllExercises.map((exercise) => (
              <MenuItem key={exercise.id} value={exercise.id}>
                {exercise.name} - {exercise.complexity} - {exercise.time} мин.
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ marginTop: '8px' }}
            className="add-button"
          >
            Добавить в тренировку
          </Button>
        </Box>
      </form>

      <CardActions>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button
            onClick={() => handleDeleteTraining(training_id)}
            variant="contained"
            color="error"
            sx={{
              mt: 2,
              backgroundColor: '#d32f2f', 
              '&:hover': {
                backgroundColor: '#b71c1c', 
              },
            }}
            className="delete-TrainingAndExercise-button"
          >
            Удалить тренировку
          </Button>
        </Box>
      </CardActions>
    </MuiCard>

  )
};

export default Card;