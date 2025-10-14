import './App.css'
import TaskList from './components/TaskList/TaskList'

function App() {
  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-dark mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Task Assignment App</span>
        </div>
      </nav>
      
      <TaskList />
    </div>
  )
}

export default App
