import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddTraining from './components/AddTraining';
import AddExercise from './components/AddExercise';
import ChangeExerciseComplexity from './components/ChangeExerciseComplexity';
import Card from './components/Card';
import DeleteExercise from './components/DeleteExercise';

const App = () => {
  const [Trainings, setTrainings] = useState([]);
  const [Exercise, setExercises] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [AllData, setAllData] = useState([]);
  console.log("AllData:", AllData)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainingResponse = await axios.get('http://localhost:3001/api/Trainings');
        setTrainings(trainingResponse.data);
        const exerciseResponse = await axios.get('http://localhost:3001/api/Exercise');
        setExercises(exerciseResponse.data);
        const AllDataResponse = await axios.get('http://localhost:3001/api/TrainingAndExercise');
        setAllData(AllDataResponse.data);
        
        setLoading(false);
      } catch (error) {
        setErrorMessage('Ошибка загрузки данных');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  if (loading) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="app-container">
      <h1>Управление тренировками</h1>

      <div className="messages">
        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
      </div>

      <div className="TrainingAndExercise-container">
        <div className="cards">
          {AllData.map((element, index) => (
            <Card
              key={index}
              data={element}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              setTrainings={setAllData}
              Trainings={AllData}
              AllExercises={Exercise}
            />
          ))}
        </div>
        <AddTraining
          Trainings={Trainings}
          setTrainings={setTrainings}
          setErrorMessage={setErrorMessage}
        />
      </div>

      <div className="Exercise-management">
        <AddExercise
          Exercise={Exercise}
          setExercises={setExercises}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
        <ChangeExerciseComplexity
          Exercise={Exercise}
          setExercises={setExercises}
          Trainings={Trainings}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
        <DeleteExercise
          Exercise={Exercise}
          setExercises={setExercises}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
        />
      </div>
    </div>
  );
};

export default App;