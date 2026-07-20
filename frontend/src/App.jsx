import { useState, useEffect } from "react";
import "./App.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // -----------------------
  // State Variables
  // -----------------------

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [tasks, setTasks] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  // -----------------------
  // Fetch Tasks
  // -----------------------

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/tasks");

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch tasks.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // -----------------------
  // Add Task
  // -----------------------

  const addTask = async () => {
    if (!title.trim() || !description.trim()) {
      toast.warning("Please enter both title and description.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title,
            description,
            completed: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed");
      }

      toast.success("Task added successfully!");

      setTitle("");
      setDescription("");

      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Unable to create task.");
    }
  };

  // -----------------------
  // Edit Task
  // -----------------------

  const editTask = (task) => {
    setTitle(task.title);
    setDescription(task.description);

    setEditingId(task.id);
  };
    // -----------------------
  // Update Task
  // -----------------------

  const updateTask = async () => {
    if (!title.trim() || !description.trim()) {
      toast.warning("Please enter both title and description.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${editingId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed");
      }

      toast.success("Task updated successfully!");

      setTitle("");
      setDescription("");
      setEditingId(null);

      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update task.");
    }
  };

  // -----------------------
  // Complete Task
  // -----------------------

  const completeTask = async (task) => {
    if (task.completed) {
      toast.info("Task is already completed.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${task.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            completed: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed");
      }

      toast.success("Task marked as completed!");

      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Unable to complete task.");
    }
  };

  // -----------------------
  // Delete Task
  // -----------------------

  const deleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      toast.success("Task deleted successfully!");

      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete task.");
    }
  };

  // -----------------------
  // Search + Filter
  // -----------------------

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "pending" && !task.completed);

    return matchesSearch && matchesFilter;
  });
  return (
    <div className="container">
      <h1>📋 Task Manager</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>{tasks.length}</h3>
          <p>Total Tasks</p>
        </div>

        <div className="stat-card">
          <h3>
            {tasks.filter(task => !task.completed).length}
          </h3>
          <p>Pending</p>
        </div>

        <div className="stat-card">
          <h3>
            {tasks.filter(task => task.completed).length}
          </h3>
          <p>Completed</p>
        </div>
      </div>
      {/* Task Form */}
      <div className="task-form">
        <input
          type="text"
          placeholder="Enter Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={editingId === null ? addTask : updateTask}
        >
          {editingId === null ? "Add Task" : "Update Task"}
        </button>
      </div>

      {/* Search Box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search Tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button onClick={() => setFilter("all")}>
          All
        </button>

        <button onClick={() => setFilter("pending")}>
          Pending
        </button>

        <button onClick={() => setFilter("completed")}>
          Completed
        </button>
      </div>

      {/* Preview */}
      <h3>Preview</h3>

      <p>
        <strong>Title:</strong> {title}
      </p>

      <p>
        <strong>Description:</strong> {description}
      </p>

      <hr />

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h2>📭 No Tasks Found</h2>
          
            <p>
              Try adding a task or changing your search/filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div className="task-card" key={task.id}>
              <h3>{task.title}</h3>

              <p>{task.description}</p>

              <p>
                Status:
                <span
                  className={
                    task.completed
                      ? "status completed"
                      : "status pending"
                  }
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </p>

              <div className="buttons">
                <button onClick={() => editTask(task)}>
                  Edit
                </button>

                <button
                  onClick={() => completeTask(task)}
                  disabled={task.completed}
                >
                  {task.completed
                    ? "Completed"
                    : "Complete"}
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default App;