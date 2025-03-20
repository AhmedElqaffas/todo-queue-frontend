"use client";

import { useEffect, useState } from "react";
import { Todo } from "./entities/Todo";

import DataTable from "react-data-table-component";
import { Trash } from "lucide-react";
import CreateTodoModal from "./new/CreateTodoModal";
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const loginUrl: string = process.env.NEXT_PUBLIC_LOGIN_URL as string;
const redirectUrl: string = process.env
  .NEXT_PUBLIC_COGNITO_REDIRECT_URL as string;
const congnitoClientID: string = process.env
  .NEXT_PUBLIC_COGNITO_CLIENT_ID as string;

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
      const response = await fetch(`${apiUrl}todo/remove`, {
        method: "POST",
        body: JSON.stringify(todos.map((todo: Todo) => todo.id)),
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
        const response = await fetch(`${apiUrl}todo/new`, {
          method: "POST",
          body: JSON.stringify({ text: text }),
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
        const response = await axios.get(`${apiUrl}todo/all`, {
          headers: {
            Authorization: `Bearer wyJraWQiOiJhU3NxV1NtejFVWUw2QWtaOG91UHIwNWtEMVwvdnVoZXRXTHdLTmtSbTdxaz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwNDY4NjQ4OC1lMDQxLTcwOGMtZDM3YS01MWJmOWU3NDNlZWIiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfc3p0OXhTeW92X0dvb2dsZSJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9zenQ5eFN5b3YiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI0ZG4zczNjcTR0NG1kYWpia2Z1bTAydGs4ayIsIm9yaWdpbl9qdGkiOiJmMWUyYzA5Yy1lOGZkLTRlZTYtOGU5OC1jYjg4NjFiZjUyNzIiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIHBob25lIG9wZW5pZCBlbWFpbCIsImF1dGhfdGltZSI6MTc0MjE2NTE0NywiZXhwIjoxNzQyMTY4NzQ3LCJpYXQiOjE3NDIxNjUxNDcsImp0aSI6ImY3NTczYjRjLTBkZmQtNDZlNy04OTU4LTg4MjAxOWVhMWFmMyIsInVzZXJuYW1lIjoiZ29vZ2xlXzEwOTQwNjM3OTU5MDMxMjcxMTg2NiJ9.t_T44Hq_Sh-X25baLXe0EDtnI2Db4Nj-pCmMUZ5xvpXTEA-8g0qhMplpJzbqEj9tZH_9SiZvlKM6UwrYp9IaVbXUxr-o5m6KoA4_WZh0HFIz-o-KMXWTw4_F814e2voUY0FlGWrdtZHTna9OvBPydJYoYP2QdLDoj5g0fDf_rsq4DcOlKHOPeBkIOGlxkRHk13oSb202bVzBuP7AVV3cnmfHFEcW-uLwR_uJ91Bo5fhAM3oyouA4uBt39iRyI4adSzOVLHMN5ztR2ttBCQ5OUw0hg5cdbH4_S4B70cLFd4LK1DFv0hzOFrKhpJZK_AZxl-KnDV_MScH6BZmzI3mh4Q`,
          },
        });
        setData(response.data);
      } catch (error: unknown) {
        console.error(error);
        // check if axios error is 401
        if (error instanceof AxiosError && error.response?.status === 401) {
          redirect(
            `${loginUrl}?client_id=${congnitoClientID}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone&redirect_uri=${redirectUrl}`
          );
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
