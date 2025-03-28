"use client";

import { useEffect, useState } from "react";
import { Todo } from "./entities/Todo";

import DataTable from "react-data-table-component";
import { Trash } from "lucide-react";
import CreateTodoModal from "./new/CreateTodoModal";
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { Tokens } from "./value_objects/Tokens";
const apiUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;

const deleteTodoIcon = {
  color: "red",
  cursor: "pointer",
};

const deleteAllButtonTheme = {
  backgroundColor: "red",
  margin: "10px",
  padding: "10px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};

const createTodoButtonTheme = {
  backgroundColor: "green",
  marginTop: "10px",
  padding: "10px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};

export default function NewTodo() {
  // DataTable doesn't handle the theme on its own, we have to specify whether to use dark or light
  const [prefersDarkTheme, setPrefersDarkTheme] = useState<string>("light");

  const [data, setData] = useState<Todo[]>([]);
  const [pending, setPending] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Todo[]>([]);

  const [isCreateTodoModalOpen, setCreateTodoModalOpen] = useState(false);

  const columns = [
    {
      name: "Item",
      selector: (row: Todo) => row.text,
      cell: (row: Todo) => {
        return row.text;
      },
    },
    {
      name: "Created At",
      selector: (row: Todo) => row.dateCreated,
    },
    {
      name: "",
      cell: (row: Todo) => {
        return (
          <Trash
            style={deleteTodoIcon}
            onClick={() => {
              deleteTodo(row);
            }}
          />
        );
      },
    },
  ];

  async function deleteTodo(todo: Todo) {
    deleteSelectedTodos([todo]);
  }

  async function deleteSelectedTodos(todos: Todo[]) {
    setPending(true);
    try {
      const tokens = localStorage.getItem("tokens");
      const accessToken = tokens
        ? (JSON.parse(tokens) as Tokens).accessToken
        : null;
      const response = await fetch(`${apiUrl}todo/remove`, {
        method: "POST",
        body: JSON.stringify(todos.map((todo: Todo) => todo.id)),
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      setData(data.filter((todo: Todo) => !todos.includes(todo)));
      setSelectedRows([]);
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  const handleDeleteSelectedTodosClicked = async () =>
    deleteSelectedTodos(selectedRows);

  const handleSelectedRowsChanged = (selectedRows: Todo[]) =>
    setSelectedRows(selectedRows);

  const handleCreateNewTodoClicked = () => setCreateTodoModalOpen(true);

  async function handleModalClosed(text?: string) {
    try {
      // if text is undefined, then user dismissed the dialog without clicking create button
      if (text) {
        const tokens = localStorage.getItem("tokens");
        const accessToken = tokens
          ? (JSON.parse(tokens) as Tokens).accessToken
          : null;
        const response = await fetch(`${apiUrl}todo/new`, {
          method: "POST",
          body: JSON.stringify({ text: text }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to create todo");
        }
        const result = await response.json();
        setData([...data, result]);
      }

      setCreateTodoModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setPrefersDarkTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
    const fetchData = async () => {
      try {
        const tokens = localStorage.getItem("tokens");
        const accessToken = tokens
          ? (JSON.parse(tokens) as Tokens).accessToken
          : null;
        const response = await axios.get(`${apiUrl}todo/all`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setData(response.data.collection); // krakend returns the collection in a collection object
      } catch (error: unknown) {
        console.error(error);
        // check if axios error is 401
        if (error instanceof AxiosError && error.response?.status === 401) {
          redirect(error.response?.headers["login-url"]);
        }
      } finally {
        setPending(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <DataTable
        theme={prefersDarkTheme}
        columns={columns}
        data={data}
        selectableRows
        highlightOnHover
        progressComponent={<div>Loading items...</div>}
        progressPending={pending}
        onSelectedRowsChange={(rows) =>
          handleSelectedRowsChanged(rows.selectedRows)
        }
      />
      {!pending && (
        <button
          style={createTodoButtonTheme}
          onClick={handleCreateNewTodoClicked}>
          Create New
        </button>
      )}
      {selectedRows.length > 0 && !pending && (
        <button
          style={deleteAllButtonTheme}
          onClick={handleDeleteSelectedTodosClicked}>
          Delete Selected
        </button>
      )}

      <CreateTodoModal
        open={isCreateTodoModalOpen}
        onClose={handleModalClosed}
      />
    </div>
  );
}
