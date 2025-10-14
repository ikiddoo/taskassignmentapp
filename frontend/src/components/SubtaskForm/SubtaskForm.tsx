import React from 'react';
import type { Skill, SubtaskInput } from '../../types';
import './SubtaskForm.css';

interface SubtaskFormProps {
  subtask: SubtaskInput;
  skills: Skill[];
  level: number;
  onUpdate: (subtask: SubtaskInput) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  subtask,
  skills,
  level,
  onUpdate,
  onRemove,
  disabled = false,
}) => {
  const maxNestingLevel = 3; // Limit nesting to 3 levels for UX

  const handleTitleChange = (title: string) => {
    onUpdate({ ...subtask, title });
  };

  const handleSkillToggle = (skillId: number) => {
    const requiredSkillIds = subtask.requiredSkillIds.includes(skillId)
      ? subtask.requiredSkillIds.filter(id => id !== skillId)
      : [...subtask.requiredSkillIds, skillId];
    
    onUpdate({ ...subtask, requiredSkillIds });
  };

  const handleAddSubtask = () => {
    const newSubtask: SubtaskInput = {
      title: '',
      requiredSkillIds: [],
      subtasks: [],
    };
    const subtasks = [...(subtask.subtasks || []), newSubtask];
    onUpdate({ ...subtask, subtasks });
  };

  const handleUpdateSubtask = (index: number, updatedSubtask: SubtaskInput) => {
    const subtasks = [...(subtask.subtasks || [])];
    subtasks[index] = updatedSubtask;
    onUpdate({ ...subtask, subtasks });
  };

  const handleRemoveSubtask = (index: number) => {
    const subtasks = (subtask.subtasks || []).filter((_, i) => i !== index);
    onUpdate({ ...subtask, subtasks });
  };

  const indentClass = `subtask-level-${Math.min(level, 3)}`;

  return (
    <div className={`subtask-container ${indentClass}`}>
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center bg-light">
          <span className="fw-bold">
            <i className="bi bi-diagram-3 me-2"></i>
            Subtask {level > 1 && `(Level ${level})`}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onRemove}
            disabled={disabled}
            title="Remove subtask"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="card-body">
          {/* Subtask Title */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Subtask Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter subtask description..."
              value={subtask.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              disabled={disabled}
              required
            />
          </div>

          {/* Required Skills */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Required Skills <span className="text-danger">*</span>
            </label>
            <div className="d-flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`subtask-skill-${level}-${skill.id}-${Math.random()}`}
                    checked={subtask.requiredSkillIds.includes(skill.id)}
                    onChange={() => handleSkillToggle(skill.id)}
                    disabled={disabled}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`subtask-skill-${level}-${skill.id}-${Math.random()}`}
                  >
                    <span className={`badge ${
                      subtask.requiredSkillIds.includes(skill.id)
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}>
                      {skill.name}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Nested Subtasks */}
          {subtask.subtasks && subtask.subtasks.length > 0 && (
            <div className="nested-subtasks mb-3">
              <hr />
              <h6 className="text-muted mb-3">
                <i className="bi bi-arrows-expand me-2"></i>
                Nested Subtasks ({subtask.subtasks.length})
              </h6>
              {subtask.subtasks.map((nestedSubtask, index) => (
                <SubtaskForm
                  key={index}
                  subtask={nestedSubtask}
                  skills={skills}
                  level={level + 1}
                  onUpdate={(updated) => handleUpdateSubtask(index, updated)}
                  onRemove={() => handleRemoveSubtask(index)}
                  disabled={disabled}
                />
              ))}
            </div>
          )}

          {/* Add Nested Subtask Button */}
          {level < maxNestingLevel && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleAddSubtask}
              disabled={disabled}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Nested Subtask
            </button>
          )}
          {level >= maxNestingLevel && (
            <small className="text-muted d-block mt-2">
              <i className="bi bi-info-circle me-1"></i>
              Maximum nesting level reached
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtaskForm;
