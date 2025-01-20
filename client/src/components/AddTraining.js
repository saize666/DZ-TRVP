import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Box } from '@mui/material';

const AddTraining = ({ setErrorMessage }) => {
  const [TrainingName, setTrainingName] = useState('');
  const [TrainingDuration, setVariantNumber] = useState('');

  const handleAddTraining = () => {
    if (!TrainingName || !TrainingDuration) {
      setErrorMessage('Пожалуйста, укажите название и продолжительность тренировки');
      setTrainingName('');
      setVariantNumber('');
      return;
    }

    // Проверка, чтобы TrainingDuration содержал только цифры
    if (!/^\d+$/.test(TrainingDuration)) {
      setErrorMessage('Продолжительность тренировки должна содержать только положительные цифры');
      setTrainingName('');
      setVariantNumber('');
      return;
    }

    axios
      .post('http://localhost:3001/api/Trainings', {
        name: TrainingName,
        time: TrainingDuration,
      })
      .then(() => {
        setTrainingName('');
        setVariantNumber('');
        setErrorMessage('');
        window.location.reload();
      })
      .catch(() => setErrorMessage('Ошибка при добавлении варианта тренировки'));
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: '8px', mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Добавить вариант тренировки
      </Typography>
      <TextField
        label="Укажите название тренировки"
        value={TrainingName}
        onChange={(e) => setTrainingName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Продолжительность тренировки"
        type="number"
        variant="outlined"
        fullWidth
        value={TrainingDuration}
        onChange={(e) => setVariantNumber(e.target.value)}
        inputProps={{ min: 0 }}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleAddTraining}>
        Добавить вариант тренировки
      </Button>
    </Box>
  );
};

export default AddTraining;
