import React, { useState, useEffect } from 'react';
import type { Task, Developer } from '../../types';
import { api } from '../../services/api';
import './TaskList.css';

interface TaskListProps {
  onCreateTask?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ onCreateTask }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  // load tasks and developers on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, developersData] = await Promise.all([
        api.getTasks(),
        api.getDevelopers(),
      ]);
      setTasks(tasksData);
      setDevelopers(developersData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      setUpdatingTaskId(taskId);
      setError(null);
      const updatedTask = await api.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      console.error('Error updating status:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAssignDeveloper = async (taskId: number, developerId: string) => {
    try {
      setUpdatingTaskId(taskId);
      setError(null);
      
      const devId = developerId === '' ? null : parseInt(developerId);
      const updatedTask = await api.updateTask(taskId, { 
        assignedDeveloperId: devId 
      });
      
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to assign developer';
      setError(errorMessage);
      console.error('Error assigning developer:', err);
      
      loadData();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const developerHasRequiredSkills = (developer: Developer, task: Task): boolean => {
    const developerSkillIds = developer.skills.map(skill => skill.id);
    const requiredSkillIds = task.requiredSkills.map(skill => skill.id);
    return requiredSkillIds.every(skillId => developerSkillIds.includes(skillId));
  };

  const getEligibleDevelopers = (task: Task): Developer[] => {
    return developers.filter(dev => developerHasRequiredSkills(dev, task));
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tasks</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success" 
            onClick={onCreateTask}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create Task
          </button>
          <button className="btn btn-primary" onClick={loadData}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="alert alert-info">
          No tasks found. Create your first task to get started!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '40%' }}>Task Title</th>
                <th style={{ width: '20%' }}>Skills</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '25%' }}>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const eligibleDevelopers = getEligibleDevelopers(task);
                const isUpdating = updatingTaskId === task.id;
                
                return (
                  <tr key={task.id} className={isUpdating ? 'table-secondary' : ''}>
                    {/* Task Title */}
                    <td>
                      <div className="task-title">{task.title}</div>
                    </td>

                    {/* Skills */}
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {task.requiredSkills.map((skill) => (
                          <span key={skill.id} className="badge bg-info text-dark">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <select
                        className={`form-select form-select-sm status-select status-${task.status.toLowerCase().replace(' ', '-')}`}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="To-do">To-do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>

                    {/* Assignee */}
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={task.assignedDeveloper?.id || ''}
                        onChange={(e) => handleAssignDeveloper(task.id, e.target.value)}
                        disabled={isUpdating}
                      >
                        <option value="">Unassigned</option>
                        {eligibleDevelopers.length > 0 ? (
                          eligibleDevelopers.map((dev) => (
                            <option key={dev.id} value={dev.id}>
                              {dev.name}
                            </option>
                          ))
                        ) : (
                          <option disabled>No eligible developers</option>
                        )}
                      </select>
                      {eligibleDevelopers.length === 0 && (
                        <small className="text-muted d-block mt-1">
                          No developers with required skills
                        </small>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4">
        <div className="row">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Total Tasks</h5>
                <p className="card-text display-6">{tasks.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">In Progress</h5>
                <p className="card-text display-6">
                  {tasks.filter(t => t.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Completed</h5>
                <p className="card-text display-6">
                  {tasks.filter(t => t.status === 'Done').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
