import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Typography, Box } from '@mui/material';

const DeleteExercise = ({ Exercise, setExercises, setErrorMessage, setSuccessMessage }) => {
  const [selectedExerciseToDelete, setSelectedExerciseToDelete] = useState('');

  const handleDeleteExercise = () => {
    if (!selectedExerciseToDelete) {
      setErrorMessage('Пожалуйста, выберите упражнение');
      return;
    }

    axios.delete(`http://localhost:3001/api/deleteExercise/${selectedExerciseToDelete}`)
      .then(() => {
        const updatedExercise = Exercise.filter(exercise => exercise.id !== parseInt(selectedExerciseToDelete));
        setExercises(updatedExercise);
        setSelectedExerciseToDelete('');
        window.location.reload();
        setErrorMessage('');
        setSuccessMessage('Упражнение удалено');
      })
      .catch(() => {
        setErrorMessage('Ошибка при удалении');
      });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 100 }}>
  <Typography variant="h6">Удалить упражнение</Typography>
  <TextField
    select
    label="Выберите упражнение"
    value={selectedExerciseToDelete}
    onChange={(e) => setSelectedExerciseToDelete(e.target.value)}
    fullWidth
    sx={{ mb: 2 }}
  >
    {Exercise.map((exercise) => (
      <MenuItem key={exercise.id} value={exercise.id}>
        {exercise.name} ({exercise.complexity})
      </MenuItem>
    ))}
  </TextField>
  <Button 
    variant="contained" 
    color="primary" 
    onClick={handleDeleteExercise}
    disabled={!selectedExerciseToDelete}
  >
    Удалить
  </Button>
</Box>

  );
};

export default DeleteExercise;
