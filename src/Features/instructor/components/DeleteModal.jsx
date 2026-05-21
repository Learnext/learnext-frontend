// src/Features/instructor/components/DeleteModal.jsx
import React from "react";

const DeleteModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-confirm">
        <h3>Xác nhận xóa</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Hủy
          </button>
          <button className="btn-delete-confirm" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
