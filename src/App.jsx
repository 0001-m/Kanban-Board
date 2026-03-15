import { useCallback, useEffect, useState } from "react"; // add useCallback
import { useDrop } from "react-dnd";
import "./App.css";
import AddTask from "./components/AddTask";
import ToDo from "./components/ToDo";

function App() {
  const [taskList, setTaskList] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    // load tasks from local storage
    let array = localStorage.getItem("taskList");
    if (array) {
      try {
        const parsed = JSON.parse(array);
        // add id if missing
        const withIds = parsed.map((task) => ({
          ...task,
          id: task.id || Date.now() + Math.random(),
        }));
        setTaskList(withIds);
      } catch (e) {
        console.error("error parsing taskList from localStorage:", e);
        localStorage.removeItem("taskList");
      }
    }

    // load completed tasks from local storage
    let completedArray = localStorage.getItem("completed");
    if (completedArray) {
      try {
        const parsed = JSON.parse(completedArray);
        setCompleted(parsed);
      } catch (e) {
        console.error("error parsing completed from localStorage:", e);
        localStorage.removeItem("completed");
      }
    }
  }, []);

  // wrap in useCallback so useDrop always sees the latest taskList and completed
  // without this, the drop handler captures stale empty arrays from mount time
  const addToCompleted = useCallback(
    (id) => {
      // find the task to move
      const taskToMove = taskList.find((task) => task.id === id);
      if (taskToMove) {
        // add to completed
        const newCompleted = [...completed, taskToMove];
        setCompleted(newCompleted);
        // remove from taskList
        setTaskList((prev) => prev.filter((task) => task.id !== id));
        // save to local storage
        localStorage.setItem("completed", JSON.stringify(newCompleted));
      }
    },
    [taskList, completed] // re-creates whenever these change
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "todo",
      drop: (item) => addToCompleted(item.id),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [addToCompleted] // re-registers drop whenever addToCompleted updates
  );

  return (
    <div className="min-h-screen bg-gray-300">
      <h1 className="text-2xl font-bold py-4 pl-6">Kanban Board</h1>
      <p className="text-xl pl-6">Hi there</p>
      <div className="flex flex-row items-center">
        <p className="text-xl pl-6">Click</p>
        <AddTask taskList={taskList} setTaskList={setTaskList} />
        <p className="text-xl my-2">to add a new task</p>
      </div>
      <div className="flex flex-row">
        <div className="w-full">
          <h2 className="ml-6 text-xl font-semibold w-3/4 max-w-lg my-2 py-1 px-4 bg-gray-200">
            To Do:
          </h2>
          <div className="ml-6 flex flex-col-reverse">
            {taskList.map((task) => (
              <ToDo
                key={task.id}
                task={task}
                taskList={taskList}
                setTaskList={setTaskList}
                storageKey="taskList"
              />
            ))}
          </div>
        </div>

        {/* visual feedback when hovering over the drop zone */}
        <div
          className={`w-full flex flex-col transition-colors ${isOver ? "bg-green-100" : ""}`}
          ref={drop}
        >
          <h2 className="text-xl font-semibold w-3/4 max-w-lg my-2 py-1 px-4 bg-gray-200">
            Completed:
          </h2>
          <div className="min-h-[200px] border-dashed border-2 border-gray-300 p-4 rounded-lg">
            {completed.map((task) => (
              <ToDo
                key={task.id}
                task={task}
                taskList={completed}
                setTaskList={setCompleted}
                storageKey="completed"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;