import React, { useState, useEffect } from 'react';
import type { Skill } from '../../types';
import { api } from '../../services/api';
import './CreateTask.css';

interface CreateTaskProps {
  onTaskCreated?: () => void;
  onCancel?: () => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onTaskCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
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

    try {
      setSubmitting(true);
      setError(null);
      
      await api.createTask({
        title: title.trim(),
        requiredSkillIds: selectedSkills,
      });
      
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
