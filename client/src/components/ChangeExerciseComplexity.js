import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Box } from '@mui/material';

const ChangeExerciseComplexity = ({ Exercise, setExercises, setErrorMessage, setSuccessMessage }) => {
  const [selectedExerciseToChange, setSelectedExerciseToChange] = useState('');
  const [newExerciseType, setNewExerciseType] = useState('');

  const exerciseTypes = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
  ];

  const handleChangeExerciseComplexity = () => {
    if (!selectedExerciseToChange || !newExerciseType) {
      setErrorMessage('Пожалуйста, выберите упражнение и новый тип');
      return;
    }

    axios.put(`http://localhost:3001/api/Exercise/${selectedExerciseToChange}`, { complexity: newExerciseType })
      .then(() => {
        const updatedExercises = Exercise.map((exercise) =>
          exercise.id === parseInt(selectedExerciseToChange) ? { ...exercise, complexity: newExerciseType } : exercise
        );
        setExercises(updatedExercises);
        setSelectedExerciseToChange('');
        setNewExerciseType('');
        window.location.reload()
        setErrorMessage('');
        setSuccessMessage('Сложность упражнения успешно изменена');
      })
      .catch(() => {
        setErrorMessage('Ошибка при обновлении сложности упражнения');
      });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2 }}>
          <Typography variant="h6">Изменить тип упражнения</Typography>
          <TextField
            select
            label="Выберите упражнение"
            value={selectedExerciseToChange}
            onChange={(e) => setSelectedExerciseToChange(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {Exercise.map((exercise) => (
              <MenuItem key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.complexity})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Новый тип упражнения"
            value={newExerciseType}
            onChange={(e) => setNewExerciseType(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {exerciseTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleChangeExerciseComplexity}
            disabled={!selectedExerciseToChange || !newExerciseType}
          >
            Обновить тип
          </Button>
    </Box>
  );
};

export default ChangeExerciseComplexity;
