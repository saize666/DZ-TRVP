const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Настройки подключения к базе данных
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678', 
  database: 'trener',
  port: 3306,
});


// Проверка подключения к базе данных
db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('Подключение к базе данных установлено');
  }
});


// Получить все варианты тренировок
app.get('/api/Trainings', (req, res) => {
  db.query('SELECT * FROM training', (err, results) => {
    if (err) {
      res.status(500).send('Ошибка получения вариантов тренировок');
    } else {
      res.json(results);
    }
  });
});

// Добавить новую тренировку
app.post('/api/Trainings', (req, res) => {
  const { name, time } = req.body;

  if (!name || !time) {
    return res.status(400).send('Пожалуйста, укажите название и продолжительность тренировки');
  }

  // Проверяем, существует ли уже тренировка с таким названием и продолжительностью
  db.query(
    'SELECT * FROM training WHERE name = ?',
    [name, time],
    (err, results) => {
      if (err) {
        console.error('Ошибка при проверке тренировки:', err);
        return res.status(500).send('Ошибка при проверке тренировки');
      }

      if (results.length > 0) {
        return res.status(400).send('Тренировка с таким днем недели и номером уже существует');
      }

      // Если не существует, добавляем тренировку
      db.query(
        'INSERT INTO training (name, time) VALUES (?, ?)',
        [name, time],
        (err, results) => {
          if (err) {
            console.error('Ошибка при добавлении тренировки:', err);
            return res.status(500).send('Ошибка при добавлении тренировки');
          }

          res.json({
            id: results.insertId,
            name: name,
            time: time,
          });
        }
      );
    }
  );
});

// Удалить тренировку и связанные записи из training_variant_exercise
app.delete('/api/Trainings/:id', (req, res) => {
  const { id } = req.params;

  // Начинаем с удаления записей из training_variant_exercise
  db.query('DELETE FROM training_variant_exercise WHERE exercise_id = ?', [id], (err) => {
    if (err) {
      return res.status(500).send('Ошибка при удалении связанных упражнений из тренировки');
    }

    // Затем удаляем сам Тренировка
    db.query('DELETE FROM training WHERE id = ?', [id], (err) => {
      if (err) {
        res.status(500).send('Ошибка при удалении тренировки');
      } else {
        res.send('Тренировка и связанные упражнения успешно удалены');
      }
    });
  });
});

// Endpoint для добавления нового упражнения
app.post('/api/Exercise', (req, res) => {
  const { name, complexity, time } = req.body;

  if (!name || !complexity || !time) {
    return res.status(400).send('Название и тип упражнения обязательны');
  }

  const query = 'INSERT INTO exercise (name, complexity, time) VALUES (?, ?, ?)';
  db.query(query, [name, complexity, time], (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении упражнения:', err);
      return res.status(500).send('Ошибка при добавлении упражнения');
    }

    // Возвращаем добавленное упражнение
    const newExercise = {
      id: results.insertId,
      name,
      complexity,
      time
    };
    res.status(201).json(newExercise);
  });
});

// Получение упражнения
app.get('/api/Exercise', (req, res) => {
  db.query('SELECT * FROM exercise', (err, results) => {
    if (err) {
      res.status(500).send('Ошибка получения упражнений');
    } else {
      res.json(results);
    }
  });
});

// Смена типа упражнения
app.put('/api/Exercise/:id', (req, res) => {
  const { id } = req.params;
  const { complexity } = req.body;

  // Проверка, что передан новый тип упражнения
  if (!complexity) {
    return res.status(400).json({ error: 'Пожалуйста, укажите новый тип упражнения' });
  }

  // Шаг 1: Получаем информацию о текущем упражнении по id
  db.query('SELECT * FROM exercise WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка при проверке существования упражнения' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Упражнение не найдено' });
    }

    const currentComplexity = results[0].complexity;

    // Если сложность уже совпадает, ничего не обновляем
    if (currentComplexity === complexity) {
      return res.status(200).json({ message: 'Сложность упражнения уже установлена на указанное значение' });
    }

    // Шаг 2: Обновляем тип упражнения
    const updateQuery = 'UPDATE exercise SET complexity = ? WHERE id = ?';
    db.query(updateQuery, [complexity, id], (err, updateResults) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при обновлении типа упражнения' });
      }

      // Отправляем успешный ответ
      res.status(200).json({
        id,
        complexity
      });
    });
  });
});



// Получить упражнения для выбранной тренировки
app.get('/api/Trainings/:id/Exercise', (req, res) => {
  const TrainingID = req.params.id;

  db.query(
    `SELECT e.id AS exercise_id, e.name AS exercise_name, e.time AS exercise_time
     FROM exercise e
     JOIN training_variant_exercise tve ON e.id = tve.exercise_id
     WHERE tve.training_id = ?`,
    [TrainingID],
    (err, results) => {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err);
        return res.status(500).send('Ошибка сервера');
      }

      console.log('Результаты запроса:', results);
      res.json(results);
    }
  );
});




app.get('/api/Trainings', (req, res) => {
  db.query(
    'SELECT id, name FROM training', 
    (err, results) => {
      if (err) {
        console.error('Ошибка при получении тренировки:', err);
        return res.status(500).send('Ошибка при получении тренировки');
      }
      res.json(results);
    }
  );
});

// Удалить упражнение из тренировки
app.delete('/api/TrainingExercises/:TrainingID/:ExerciseID', (req, res) => {
  const { TrainingID, ExerciseID } = req.params;

  // Убедитесь, что оба параметра переданы
  if (!TrainingID || !ExerciseID) {
    return res.status(400).send('Некорректные параметры запроса');
  }

  // SQL-запрос с двумя условиями
  const query = 'DELETE FROM training_variant_exercise WHERE training_id = ? AND exercise_id = ?';

  db.query(query, [TrainingID, ExerciseID], (err, result) => {
    if (err) {
      console.error('Ошибка при удалении упражнения из тренировки:', err);
      return res.status(500).send('Ошибка при удалении упражнения из тренировки');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Упражнение не найдено в указанной тренировке');
    }

    res.send('Упражнение успешно удалено из тренировки');
  });
});

// Вывод упражнения в тренировку
app.get('/api/TrainingAndExercise', (req, res) => {
  const query = `
    SELECT 
      mv.id AS training_id,
      mv.name,
      mv.time,
      d.id AS exercise_id,
      d.name AS exercise_name,
      d.complexity,
      d.time AS exercise_time
    FROM 
      training mv
    LEFT JOIN 
      training_variant_exercise mvd ON mv.id = mvd.training_id
    LEFT JOIN 
      exercise d ON mvd.exercise_id = d.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send('Ошибка получения тренировке');
    } else {
      // Группируем упражнения по тренировке
      const Trainings = [];
      results.forEach(row => {
        const existingMenu = Trainings.find(TrainingAndExercise => TrainingAndExercise.training_id === row.training_id);
        
        if (!existingMenu) {
          Trainings.push({
            training_id: row.training_id,
            name: row.name,
            time: row.time,
            Exercise: [
              {
                exercise_id: row.exercise_id,
                exercise_name: row.exercise_name,
                complexity: row.complexity,
                exercise_time: row.exercise_time
              }
            ]
          });
        } else {
          existingMenu.Exercise.push({
            exercise_id: row.exercise_id,
            exercise_name: row.exercise_name,
            complexity: row.complexity,
            exercise_time: row.exercise_time
          });
        }
      });

      res.json(Trainings);
    }
  });
});

app.post('/api/AddExerciseToTraining/:training_id', (req, res) => {
  const training_id = parseInt(req.params.training_id, 10);
  const { Tag } = req.body; 

  if (!Tag) {
    return res.status(400).json({ error: 'Необходимо выбрать упражнение' });
  }

  db.query('SELECT * FROM exercise WHERE id = ?', [Tag], (err, results) => {
    if (err) {
      return res.status(500).send('Ошибка при запросе упражнения');
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Упражнение не найдено' });
    }

    db.query('SELECT * FROM training_variant_exercise WHERE training_id = ? AND exercise_id = ?', 
      [training_id, Tag], (err, existingResults) => {
        if (err) {
          return res.status(500).send('Ошибка при проверке существующих упражнений в тренировке');
        }

        if (existingResults.length > 0) {
          return res.status(400).json({ error: 'Это упражнение уже добавлено в тренировку' });
        }

        db.query('INSERT INTO training_variant_exercise (training_id, exercise_id) VALUES (?, ?)', 
          [training_id, Tag], (err) => {
            if (err) {
              return res.status(500).send('Ошибка при добавлении упражнения в тренировке');
            }

            res.status(201).json({ success: 'Упражнение успешно добавлено в тренировку' });
          });
      });
  });
});


app.post('/api/MoveExercise/:ExerciseID', (req, res) => {
  const { prevVariantId, selectedTrainingID } = req.body;
  const ExerciseID = parseInt(req.params.ExerciseID); 

  if (selectedTrainingID == null) {
    return res.status(500).json({ error: 'Ошибка при выборе тренировки' });
  }

  db.query('DELETE FROM training_variant_exercise WHERE training_id = ? AND exercise_id = ?', [parseInt(prevVariantId), ExerciseID], (err) => {
    if (err) {
        return res.status(500).json({ error: 'Ошибка при удалении записи' });
    }

    db.query('INSERT INTO training_variant_exercise VALUES (?, ?)', [parseInt(selectedTrainingID), ExerciseID], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при добавлении записи' });
        }
        return res.status(200).json({ success: 'Упражнение успешно перемещено' });
        });
  });
});

app.delete('/api/deleteExercise/:ExerciseID', (req, res) => {
  const ExerciseID = req.params.ExerciseID;

  const deleteFromTrainingExercises = `DELETE FROM training_variant_exercise WHERE exercise_id = ?`;
  db.query(deleteFromTrainingExercises, [ExerciseID], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Ошибка при удалении из training_variant_exercise');
      return;
    }

    // После этого удаляем из Exercise
    const deleteFromExercise = `DELETE FROM exercise WHERE id = ?`;
    db.query(deleteFromExercise, [ExerciseID], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Ошибка при удалении из exercise');
        return;
      }

      res.send('Упражнение успешно удалено');
    });
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер работает на http://localhost:${port}`);
});
