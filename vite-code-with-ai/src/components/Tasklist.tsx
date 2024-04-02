import React from "react";

interface Task {
  id: number;
  description: string;
}

interface TasklistProps {
  tasks: Task[];
  nb_tasks: number;
  taskDoTo: number;
  taskDone: number;
}

const Tasklist: React.FC<TasklistProps> = ({ tasks, nb_tasks, taskDoTo ,taskDone}) => {
  return (
    <div className="tasklist bg-white p-4 rounded-lg shadow-md text-black">
      {taskDoTo > nb_tasks ? (
        <h2>Tasks Done</h2>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">
            Task List : {taskDoTo}/{taskDone}/{nb_tasks}
          </h2>
          <ul className="list-disc list-inside">
            {tasks.map((task,index) => (
              <li key={task.id} className={`mb-2 ${taskDoTo>task.id? "text-green-400":taskDoTo==task.id?"text-green-400":"text-black"}`}>
                {task.description}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};



export default Tasklist;
