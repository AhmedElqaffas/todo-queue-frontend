import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import { FormEvent, useEffect, useState } from "react";

interface CreateTodoModalProps {
  open: boolean;
  onClose: (text?: string) => void;
}

const modalTheme = {
  position: "absolute" as const,
  backgroundColor: "var(--modal-bg)",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  padding: "25px",
  border: "2px solid #000",
};

const formTheme = {
  display: "flex",
  alignItems: "center",
};

const buttonTheme = {
  backgroundColor: "green",
  padding: "5px 5px",
  margin: "15px",
  borderRadius: "5px",
};

const disabledButtonTheme = {
  ...buttonTheme,
  opacity: 0.5,
};

const textInputTheme = {
  border: "2px solid #000",
  color: "#000",
  padding: "5px",
};

const disabledTextTheme = {
  ...textInputTheme,
  opacity: 0.3,
};

const todoTextInputName = "todoText";

export default function CreateTodoModal(props: CreateTodoModalProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Prevent the browser from reloading the page
    e.preventDefault();
    setIsCreating(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    await props.onClose(formData.get(todoTextInputName) as string);
    setIsCreating(false);
  };

  return (
    <Modal open={props.open} onClose={() => props.onClose()}>
      <div style={modalTheme}>
        <form onSubmit={handleSubmit} style={formTheme}>
          <input
            type='text'
            style={isCreating ? disabledTextTheme : textInputTheme}
            name={todoTextInputName}
            disabled={isCreating}
          />
          <button
            style={isCreating ? disabledButtonTheme : buttonTheme}
            type='submit'
            disabled={isCreating}>
            Create
          </button>
          {isCreating && <CircularProgress />}
        </form>
      </div>
    </Modal>
  );
}
