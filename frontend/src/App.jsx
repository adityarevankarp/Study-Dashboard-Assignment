import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
const API_BASE_URL = "http://localhost:5000/api"; // Base URL for your API

function App() {
  // State variables
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    extra: "", // Extra field
    subject: "Other", // Default subject
    timeSpent: 0,
    isCompleted: false,
    subtasks: [],
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  // Fetch subjects when the component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/subjects`);
        setSubjects(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, []);
  const analyzeData = () => {
    const subjectTimeData = subjects.map((subject) => {
      const totalTime = subject.tasks.reduce(
        (sum, task) => sum + task.timeSpent,
        0
      );
      return { name: subject.name, time: totalTime };
    });

    return subjectTimeData;
  };
  // Handle changes in the form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  // Handle checkbox change for task completion
  const handleCheckboxChange = (e) => {
    setNewTask((prevTask) => ({ ...prevTask, isCompleted: e.target.checked }));
  };

  // Handle time spent input change
  const handleTimeSpentChange = (e) => {
    setNewTask((prevTask) => ({
      ...prevTask,
      timeSpent: parseInt(e.target.value) || 0, // Parse to integer, default to 0
    }));
  };

  // Add a new subject to the database
  const handleAddSubject = async () => {
    if (newSubject.trim() !== "") {
      try {
        const response = await axios.post(`${API_BASE_URL}/subjects`, {
          name: newSubject,
        });

        setSubjects([...subjects, response.data]);
        setNewSubject("");
        setShowSubjectModal(false);
      } catch (error) {
        console.error("Error adding subject:", error);
      }
    }
  };

  // Add a new task to the database (associated with a subject)
  const addTask = async () => {
    try {
      // Find the selected subject's ID
      const selectedSubject = subjects.find((s) => s.name === newTask.subject);
      if (!selectedSubject) {
        console.error("Selected subject not found!");
        return;
      }

      // Send a POST request to add the task under the selected subject
      await axios.post(
        `${API_BASE_URL}/subjects/${selectedSubject._id}/tasks`,
        newTask
      );

      // Update the tasks array in the UI (optional for immediate feedback)
      // You can refetch tasks or update the state based on your needs.
      // For simplicity, I'll omit updating the UI here.

      // Reset the newTask state
      setNewTask({
        title: "",
        description: "",
        extra: "",
        subject: "Other",
        timeSpent: 0,
        isCompleted: false,
        subtasks: [],
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Function to start editing an existing task
  // const startEditingTask = (task) => {
  //   setEditingTask(task);
  // };
  const startEditingTask = (subject, task) => {
    // Accept subject
    setEditingTask({ ...task, subject: subject.name }); // Store subject in editing task
  };
  const updateTask = async (updatedSubject, updatedTask) => {
    // Accept updatedTask and subject
    try {
      const response = await axios.put(
        `${API_BASE_URL}/subjects/${updatedSubject._id}/tasks/${updatedTask._id}`, // Correct API Endpoint
        updatedTask // Pass updated task
      );

      if (response.status === 200) {
        const updatedSubjects = subjects.map((subject) =>
          subject._id === updatedSubject._id
            ? {
                ...subject,
                tasks: subject.tasks.map((t) =>
                  t._id === updatedTask._id ? updatedTask : t
                ),
              }
            : subject
        );
        setSubjects(updatedSubjects);
        setEditingTask(null);
      } else {
        console.error("Error updating task:", response.data);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Update an existing task
  // const updateTask = async (taskId) => {
  //   try {
  //     // For now, assume tasks are updated directly in the subjects array
  //     // In a real application, you'd send a PUT request to the backend
  //     const updatedSubjects = subjects.map(subject => ({
  //       ...subject,
  //       tasks: subject.tasks.map(t =>
  //         t._id === taskId ? editingTask : t
  //       )
  //     }));

  //     setSubjects(updatedSubjects);
  //     setEditingTask(null);
  //   } catch (error) {
  //     console.error('Error updating task:', error);
  //   }
  // };

  // Delete a task from the database
  // const deleteTask = async (taskId) => {
  //   try {
  //     // For simplicity, I'm deleting directly from the subjects array
  //     // In a real app, you'd send a DELETE request to the backend
  //     const updatedSubjects = subjects.map(subject => ({
  //       ...subject,
  //       tasks: subject.tasks.filter(t => t._id !== taskId)
  //     }));
  //     setSubjects(updatedSubjects);
  //   } catch (error) {
  //     console.error('Error deleting task:', error);
  //   }
  // };

  const deleteTask = async (subjectToDeleteFrom, taskId) => {
    // Accept subject
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/subjects/${subjectToDeleteFrom._id}/tasks/${taskId}`
      );
      if (response.status === 200) {
        const updatedSubjects = subjects.map((subject) =>
          subject._id === subjectToDeleteFrom._id
            ? {
                ...subject,
                tasks: subject.tasks.filter((t) => t._id !== taskId),
              }
            : subject
        );
        setSubjects(updatedSubjects);
      } else {
        console.error("Error deleting task:", response.data);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="app-container bg-gray-100 min-h-screen py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Study Dashboard
      </h1>

      {/* Subject Management Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Subjects</h2>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Add Subject
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {subjects.map((subject) => (
            <li key={subject._id}>{subject.name}</li>
          ))}
        </ul>
      </div>

      {/* Task Form  */}
      <div className="task-form bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingTask ? "Edit Task" : "Add New Task"}
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Task Title:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter task title"
              value={editingTask ? editingTask.title : newTask.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter task description"
              value={
                editingTask ? editingTask.description : newTask.description
              }
              onChange={handleChange}
            />
          </div>

          {/* Extra Field */}
          <div>
            <label
              htmlFor="extra"
              className="block text-sm font-medium text-gray-700"
            >
              Extra:
            </label>
            <textarea
              id="extra"
              name="extra"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Add extra notes"
              value={editingTask ? editingTask.extra : newTask.extra}
              onChange={handleChange}
            />
          </div>

          {/* Subject Dropdown */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject:
            </label>
            <select
              id="subject"
              name="subject"
              className="mt-1 p-2 w-full border rounded-md"
              value={editingTask ? editingTask.subject : newTask.subject}
              onChange={handleChange}
            >
              {subjects.map((subject) => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Spent */}
          <div>
            <label
              htmlFor="timeSpent"
              className="block text-sm font-medium text-gray-700"
            >
              Time Spent (minutes):
            </label>
            <input
              type="number"
              id="timeSpent"
              name="timeSpent"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Enter time spent"
              value={editingTask ? editingTask.timeSpent : newTask.timeSpent}
              onChange={handleTimeSpentChange}
            />
          </div>

          {/* Is Completed Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCompleted"
              name="isCompleted"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={
                editingTask ? editingTask.isCompleted : newTask.isCompleted
              }
              onChange={handleCheckboxChange}
            />
            <label
              htmlFor="isCompleted"
              className="ml-2 block text-sm text-gray-900"
            >
              Completed
            </label>
          </div>

          {/* Buttons - Add/Update/Cancel */}
          <div>
            <button
              type="button"
              onClick={
                editingTask ? () => updateTask(editingTask._id) : addTask
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingTask ? "Update Task" : "Add Task"}
            </button>
            {editingTask && (
              <button
                onClick={() => setEditingTask(null)}
                type="button"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowChart(true)}
        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-8"
      >
        Analyze
      </button>
      {/* Task List */}
      {/* <div className="task-list bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Subjects {'>'} Tasks
        </h2>
        {subjects.map((subject) => (
          <div key={subject._id}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {subject.name}
            </h3>
            <ul className="space-y-3">
              {subject.tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={task.isCompleted}
                      onChange={() =>
                        updateTask({ ...task, isCompleted: !task.isCompleted })
                      }
                    />
                    <span
                      className={`ml-2 ${
                        task.isCompleted ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.subject && (
                      <span className="ml-3 px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                        {task.subject}
                      </span>
                    )}
                  </div>

                  
                  <div className="space-x-2">
                    <button
                      onClick={() => startEditingTask(task)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div> */}
      <div className="task-list bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tasks</h2>
        {subjects.map((subject) => (
          <div key={subject._id}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {subject.name}
            </h3>
            <ul className="space-y-3">
              {subject.tasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  {/* Task Information */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={task.isCompleted}
                      onChange={
                        () =>
                          updateTask(subject, {
                            ...task,
                            isCompleted: !task.isCompleted,
                          }) // Pass subject here
                      }
                    />
                    <span
                      className={`ml-2 ${
                        task.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.subject && (
                      <span className="ml-3 px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                        {task.subject}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons - Edit/Delete */}
                  <div className="space-x-2">
                    <button
                      onClick={() => startEditingTask(subject, task)} // Pass subject here
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(subject, task._id)} // Pass subject here
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
       {/* Bar Chart (Initially Hidden) */}
       {showChart && ( 
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Time Spent per Subject
          </h2>
          <BarChart width={1800} height={300} data={analyzeData()}>
            <XAxis dataKey="name" /> {/* Limit x-axis label length */}
            <YAxis />
            <CartesianGrid stroke="#f5f5f5" />
            <Tooltip />
            <Legend />
            <Bar dataKey="time" fill="#8884d8" name="Time (minutes)" />
          </BarChart>
          {/* Close button for chart */}
          <button
            onClick={() => setShowChart(false)}
            className="mt-4 text-blue-500 hover:text-blue-700 text-sm"
          >
            Close Chart
          </button>
        </div>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setShowSubjectModal(false)
          } // Close modal on outside click
        >
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add New Subject
            </h2>
            <div className="mb-4">
              <input
                type="text"
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="Enter subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddSubject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Subject
              </button>
              <button
                onClick={() => setShowSubjectModal(false)}
                type="button"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
