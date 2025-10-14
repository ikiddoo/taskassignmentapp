import { useState } from 'react'
import './App.css'
import TaskList from './components/TaskList/TaskList'
import CreateTask from './components/CreateTask/CreateTask'

function App() {
  const [currentView, setCurrentView] = useState<'list' | 'create'>('list');

  const handleCreateTask = () => {
    setCurrentView('create');
  };

  const handleTaskCreated = () => {
    setCurrentView('list');
  };

  const handleCancel = () => {
    setCurrentView('list');
  };

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Task Assignment App</span>
        </div>
      </nav>
      
      {currentView === 'list' ? (
        <TaskList onCreateTask={handleCreateTask} />
      ) : (
        <CreateTask onTaskCreated={handleTaskCreated} onCancel={handleCancel} />
      )}
    </div>
  )
}

export default App
