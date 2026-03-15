import { useEffect, useState } from "react";
import EditTask from "./EditTask";
import { useDrag } from "react-dnd";

const Todo = ({ task, taskList, setTaskList, storageKey }) => {
  const [time, setTime] = useState(task.duration);
  const [running, setRunning] = useState(false);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "todo",
    item: {
      id: task.id, // use task.id for correct identification
      projectName: task.projectName,
      taskDescription: task.taskDescription,
      timestamp: task.timestamp,
      duration: task.duration,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    let interval;
    if (running) {
      // run timer every 10ms
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  const handleStop = () => {
    setRunning(false);
    // update the task in the list with new duration
    const updatedList = taskList.map((t) =>
      t.id === task.id ? { ...t, duration: time } : t
    );
    setTaskList(updatedList);
    localStorage.setItem(storageKey, JSON.stringify(updatedList));
  };

  const handleDelete = (itemID) => {
    // remove the task from the list
    const updatedList = taskList.filter((todo) => todo.id !== itemID);
    setTaskList(updatedList);
    localStorage.setItem(storageKey, JSON.stringify(updatedList));
  };

  // format time for display
  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds / 60000) % 60);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const centi = Math.floor((milliseconds % 1000) / 10);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${centi
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <div
        className="flex flex-col items-start justify-start bg-white my-4 ml-6 py-4 px-6 w-3/4 max-w-lg"
        ref={drag}
      >
        <div className="w-full flex flex-row justify-between">
          <p className="font-semibold text-xl">{task.projectName}</p>
          <EditTask
            task={task}
            taskList={taskList}
            setTaskList={setTaskList}
            storageKey={storageKey}
          />
        </div>

        <p className="text-lg py-2">{task.taskDescription}</p>

        <div className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-evenly">
          <div className="sm:w-1/4 min-w-max text-xl font-semibold py-4">
            {formatTime(time)}
          </div>

          <div className="flex flex-row justify-evenly gap-4">
            {running ? (
              <button
                className="border rounded-lg py-1 px-3"
                onClick={() => setRunning(false)}
              >
                Stop
              </button>
            ) : (
              <button
                className="border rounded-lg py-1 px-3"
                onClick={() => setRunning(true)}
              >
                Start
              </button>
            )}
            <button
              className="border rounded-lg py-1 px-3"
              onClick={() => setTime(0)}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <button
            className="bg-red-500 text-white text-sm uppercase font-semibold py-1.5 px-3 mt-6 mb-1 rounded-lg"
            onClick={() => handleDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default Todo;
