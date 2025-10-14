import React, { useState, useEffect } from 'react';
import type { Skill, SubtaskInput, CreateTaskInput } from '../../types';
import { api } from '../../services/api';
import SubtaskForm from '../SubtaskForm/SubtaskForm';
import './CreateTask.css';

interface CreateTaskProps {
  onTaskCreated?: () => void;
  onCancel?: () => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onTaskCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await api.getSkills();
      setSkills(skillsData);
    } catch (err) {
      setError('Failed to load skills. Please try again.');
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skillId: number) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleAddSubtask = () => {
    const newSubtask: SubtaskInput = {
      title: '',
      requiredSkillIds: [],
      subtasks: [],
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const handleUpdateSubtask = (index: number, updatedSubtask: SubtaskInput) => {
    const updated = [...subtasks];
    updated[index] = updatedSubtask;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const validateSubtasks = (subtaskList: SubtaskInput[]): string | null => {
    for (const subtask of subtaskList) {
      if (!subtask.title.trim()) {
        return 'All subtasks must have a title';
      }
      if (subtask.requiredSkillIds.length === 0) {
        return 'All subtasks must have at least one required skill';
      }
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        const nestedError = validateSubtasks(subtask.subtasks);
        if (nestedError) return nestedError;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    if (selectedSkills.length === 0) {
      setError('Please select at least one skill');
      return;
    }

    // Validate subtasks
    if (subtasks.length > 0) {
      const subtaskError = validateSubtasks(subtasks);
      if (subtaskError) {
        setError(subtaskError);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const taskData: CreateTaskInput = {
        title: title.trim(),
        requiredSkillIds: selectedSkills,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
      };

      await api.createTask(taskData);
      
      setSuccess(true);
      
      // Call callback if provided, otherwise redirect after 1.5 seconds
      if (onTaskCreated) {
        setTimeout(() => {
          onTaskCreated();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Create Task</h2>
            </div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Task created successfully! Redirecting...
                </div>
              )}

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Task Title */}
                <div className="mb-4">
                  <label htmlFor="taskTitle" className="form-label fw-bold">
                    Task Title <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="taskTitle"
                    className="form-control"
                    rows={4}
                    placeholder="Enter task description (e.g., As a visitor, I want to see a responsive homepage...)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting || success}
                    required
                  />
                  <small className="form-text text-muted">
                    Describe the task in detail
                  </small>
                </div>

                {/* Required Skills */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Required Skills <span className="text-danger">*</span>
                  </label>
                  <div className="border rounded p-3 bg-light">
                    {skills.length === 0 ? (
                      <p className="text-muted mb-0">No skills available</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <div key={skill.id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`skill-${skill.id}`}
                              checked={selectedSkills.includes(skill.id)}
                              onChange={() => handleSkillToggle(skill.id)}
                              disabled={submitting || success}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`skill-${skill.id}`}
                            >
                              <span className={`badge ${
                                selectedSkills.includes(skill.id)
                                  ? 'bg-primary'
                                  : 'bg-secondary'
                              }`}>
                                {skill.name}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <small className="form-text text-muted">
                    Select the skills required to complete this task
                  </small>
                </div>

                {/* Subtasks Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label fw-bold mb-0">
                      <i className="bi bi-diagram-3 me-2"></i>
                      Subtasks
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleAddSubtask}
                      disabled={submitting || success}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Add Subtask
                    </button>
                  </div>

                  {subtasks.length === 0 ? (
                    <div className="alert alert-light border" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      No subtasks added yet. Click "Add Subtask" to create nested tasks.
                    </div>
                  ) : (
                    <div className="subtasks-container">
                      {subtasks.map((subtask, index) => (
                        <SubtaskForm
                          key={index}
                          subtask={subtask}
                          skills={skills}
                          level={1}
                          onUpdate={(updated) => handleUpdateSubtask(index, updated)}
                          onRemove={() => handleRemoveSubtask(index)}
                          disabled={submitting || success}
                        />
                      ))}
                    </div>
                  )}

                  <small className="form-text text-muted">
                    Add subtasks to break down complex tasks. Subtasks can have their own skills and nested subtasks (up to 3 levels).
                  </small>
                </div>

                {/* Info Box */}
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <strong>Note:</strong> You can assign a developer to this task later from the Task List page.
                  Only developers with the selected skills will be available for assignment.
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={submitting || success}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || success}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Save Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
