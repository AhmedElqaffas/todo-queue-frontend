"use client";

import { useEffect, useState } from "react";
import { Todo } from "./entities/Todo";

import DataTable from "react-data-table-component";
import { Trash } from "lucide-react";

const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;

const theme = {
  color: "red",
  cursor: "pointer",
};

export default function NewTodo() {
  const [data, setData] = useState([]);
  const [pending, setPending] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);

  const deleteAllButtonTheme = {
    backgroundColor: "red",
    marginTop: "10px",
    padding: "10px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    visibility: selectedRows.length ? "visible" : "hidden",
  };

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
            style={theme}
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
      const response = await fetch(`${apiUrl}RemoveTodos`, {
        method: "POST",
        body: JSON.stringify(todos.map((todo: Todo) => todo.id)),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      setData(data.filter((todo: Todo) => !todos.includes(todo)));
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  async function handleDeleteSelectedTodosClicked() {
    deleteSelectedTodos(selectedRows);
  }

  async function handleSelectedRowsChanged({ selectedRows }) {
    setSelectedRows(selectedRows);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}GetAllTodos`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setPending(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        selectableRows
        highlightOnHover
        progressComponent={<div>Loading items...</div>}
        progressPending={pending}
        onSelectedRowsChange={handleSelectedRowsChanged}
      />
      <button
        style={deleteAllButtonTheme}
        onClick={handleDeleteSelectedTodosClicked}>
        Delete All Selected
      </button>
    </div>
  );
}
