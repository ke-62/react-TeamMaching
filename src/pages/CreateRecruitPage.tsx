import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRecruitPage.css';

const CreateRecruitPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'hackathon',
    recruitNumber: '',
    roles: [] as string[],
    description: '',
    requiredTechStacks: [] as string[],
    deadline: '',
  });

  const [currentRole, setCurrentRole] = useState('');
  const [currentTech, setCurrentTech] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출
    console.log('Form submitted:', formData);
    navigate('/recruits');
  };

  const addRole = () => {
    if (currentRole.trim()) {
      setFormData({
        ...formData,
        roles: [...formData.roles, currentRole.trim()],
      });
      setCurrentRole('');
    }
  };

  const removeRole = (index: number) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter((_, i) => i !== index),
    });
  };

  const addTech = () => {
    if (currentTech.trim()) {
      setFormData({
        ...formData,
        requiredTechStacks: [...formData.requiredTechStacks, currentTech.trim()],
      });
      setCurrentTech('');
    }
  };

  const removeTech = (index: number) => {
    setFormData({
      ...formData,
      requiredTechStacks: formData.requiredTechStacks.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="create-recruit-page">
      <div className="page-header">
        <h1>새 모집 공고 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="recruit-form">
        <div className="form-section">
          <label className="form-label">프로젝트 제목</label>
          <input
            type="text"
            className="form-input"
            placeholder="예: 창의학기제 LLM 서비스 팀원 모집"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-section">
            <label className="form-label">카테고리</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="hackathon">해커톤</option>
              <option value="creative">창의학기제</option>
              <option value="capstone">캡스톤디자인</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div className="form-section">
            <label className="form-label">모집 인원</label>
            <input
              type="text"
              className="form-input"
              placeholder="예: FE 0/1, BE 1/2"
              value={formData.recruitNumber}
              onChange={(e) => setFormData({ ...formData, recruitNumber: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">모집 역할 (중복 선택)</label>
          <div className="tag-input-container">
            <div className="tag-list">
              {formData.roles.map((role, index) => (
                <span key={index} className="tag">
                  {role}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeRole(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="역할 입력 후 엔터"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRole();
                  }
                }}
              />
              <button type="button" className="btn-add" onClick={addRole}>
                추가
              </button>
            </div>
          </div>
          <div className="role-suggestions">
            {['기획/PM', '디자인', '프론트엔드', '백엔드', 'AI/데이터'].map((role) => (
              <button
                key={role}
                type="button"
                className="role-chip"
                onClick={() => {
                  if (!formData.roles.includes(role)) {
                    setFormData({
                      ...formData,
                      roles: [...formData.roles, role],
                    });
                  }
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">프로젝트 상세 설명</label>
          <textarea
            className="form-textarea"
            placeholder="프로젝트의 목적과 목표를 간단히 설명해주세요."
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="form-section">
          <label className="form-label">필요 기술 스택</label>
          <div className="tag-input-container">
            <div className="tag-list">
              {formData.requiredTechStacks.map((tech, index) => (
                <span key={index} className="tag tech-tag">
                  {tech}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTech(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input-group">
              <input
                type="text"
                className="form-input"
                placeholder="기술 스택 입력 후 엔터"
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
              />
              <button type="button" className="btn-add" onClick={addTech}>
                추가
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">모집 마감일</label>
          <input
            type="date"
            className="form-input"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/recruits')}
          >
            취소
          </button>
          <button type="submit" className="btn-submit">
            공고 등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecruitPage;
