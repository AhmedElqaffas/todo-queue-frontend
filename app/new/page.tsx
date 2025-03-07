"use client";

import { useEffect, useState } from "react";
import { Todo } from "../entities/Todo";

import DataTable from "react-data-table-component";

const theme = {
  backgroundColor: "blue",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const columns = [
  {
    name: "Title",
    selector: (row) => row.title,
    cell: (row) => {
      return <button style={theme}>{row.title}</button>;
    },
  },
  {
    name: "Year",
    selector: (row) => row.year,
  },
];

const data = [
  {
    id: 1,
    title: "Beetlejuice",
    year: "1988",
  },
  {
    id: 2,
    title: "Ghostbusters",
    year: "1984",
  },
];

export default function NewTodo() {
  //const [data, setData] = useState([]);

  const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  console.log(apiUrl);

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
      }
    };

    fetchData();
  }, [apiUrl]);

  return (
    <DataTable columns={columns} data={data} selectableRows highlightOnHover />
  );
}
